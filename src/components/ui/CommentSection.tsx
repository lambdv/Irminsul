import CommentSectionCSS from "./commentsection.module.css"
import db from "@/db/db"
import { commentsTable } from "@/db/schema/comment"
import { usersTable } from "@/db/schema/user"
import { eq, type InferInsertModel, desc } from "drizzle-orm"
import Image from "next/image"
import { revalidatePath } from "next/cache"
import Btn from "./Btn"
import { redirect } from "next/navigation"
import { format } from "timeago.js"
import Link from "next/link"
import { Suspense } from "react"
import { isUserSupporterByEmail } from "@root/src/app/(main)/pricing/actions"
import CommentSectionClient from "./CommentSectionClient"
import { getServerSession, getServerUser } from "@/lib/server-session"

const COMMENT_COOLDOWN_SECONDS = 30
const MAX_COMMENTS_PER_HOUR = 20
const MAX_COMMENTS_PER_DAY = 50

const SPAM_PATTERNS = [
  /\b(buy|sell|discount|free|prize|winner|congratulations|click here|register|signup)\b/i,
  /(http|https):\/\/[^\s]/gi,
  /(.)\1{10,}/i,
  /^[a-z0-9]{30,}$/i,
]

export default async function CommentSection(
  props: {
    pageID: string
    color?: string
    owner?: string
  },
  searchParams: { page: string }
) {
  let comments = await getComments(props.pageID)
  comments.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const numberOfComments = comments.length
  const session = await getServerSession()
  const user = await getServerUser()

  const enhancedComments = await Promise.all(
    comments.map(async (comment) => {
      const commentUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, comment.userId))
      const isSupporter = await isUserSupporterByEmail(commentUser[0]?.email)
      return {
        ...comment,
        user: commentUser[0],
        isSupporter,
      }
    })
  )

  const handleCommentSubmit = async (comment: string) => {
    "use server"
    if (!user || user === null) redirect("/login")
    await postComment(props.pageID, comment, user.id)
  }

  const handleDeleteComment = async (commentId: string) => {
    "use server"
    await db
      .delete(commentsTable)
      .where(eq(commentsTable.id, parseInt(commentId)))
    revalidatePath("/")
  }

  return (
    <CommentSectionClient
      user={user}
      numberOfComments={numberOfComments}
      comments={enhancedComments}
      pageID={props.pageID}
      color={props.color}
      owner={props.owner}
      onCommentSubmit={handleCommentSubmit}
      onDeleteComment={handleDeleteComment}
    />
  )
}

async function getComments(pageID: string): Promise<any[]> {
  "use server"
  const comments = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.page, pageID))
    .orderBy(desc(commentsTable.createdAt))
    .limit(100)
  return comments
}

function containsSpam(content: string): { isSpam: boolean; reason?: string } {
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(content)) {
      return { isSpam: true, reason: "Content matches spam pattern" }
    }
  }
  const words = content.toLowerCase().split(/\s+/)
  const uniqueWords = new Set(words)
  if (words.length > 10 && uniqueWords.size < 3) {
    return { isSpam: true, reason: "Suspicious repetitive content" }
  }
  return { isSpam: false }
}

async function checkCommentRateLimit(userId: string): Promise<{
  allowed: boolean
  reason?: string
  retryAfter?: number
}> {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const recentComments = await db
    .select({ id: commentsTable.id, createdAt: commentsTable.createdAt })
    .from(commentsTable)
    .where(eq(commentsTable.userId, userId))

  const hourlyCount = recentComments.filter(
    (c) => new Date(c.createdAt) > oneHourAgo
  ).length
  const dailyCount = recentComments.filter(
    (c) => new Date(c.createdAt) > oneDayAgo
  ).length

  if (hourlyCount >= MAX_COMMENTS_PER_HOUR) {
    return {
      allowed: false,
      reason: "Hourly comment limit reached",
      retryAfter: 3600,
    }
  }

  if (dailyCount >= MAX_COMMENTS_PER_DAY) {
    return {
      allowed: false,
      reason: "Daily comment limit reached",
      retryAfter: 86400,
    }
  }

  const lastComment = recentComments.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0]

  if (lastComment) {
    const secondsSinceLastComment =
      (now.getTime() - new Date(lastComment.createdAt).getTime()) / 1000
    if (secondsSinceLastComment < COMMENT_COOLDOWN_SECONDS) {
      return {
        allowed: false,
        reason: "Please wait before posting another comment",
        retryAfter:
          COMMENT_COOLDOWN_SECONDS - Math.floor(secondsSinceLastComment),
      }
    }
  }

  return { allowed: true }
}

async function postComment(pageID: string, comment: string, userId: string) {
  const user = await getServerUser()

  if (!user) throw new Error("User not found")

  const trimmedComment = comment.trim()

  if (trimmedComment.length === 0) throw new Error("Comment cannot be empty")

  if (trimmedComment.length > 1000)
    throw new Error("Comment cannot be longer than 1000 characters")

  if (trimmedComment.length < 1)
    throw new Error("Comment cannot be shorter than 1 character")

  if (trimmedComment === " ") throw new Error("Comment cannot be just spaces")

  const rateLimitCheck = await checkCommentRateLimit(userId)
  if (!rateLimitCheck.allowed) {
    throw new Error(rateLimitCheck.reason || "Rate limit exceeded")
  }

  const spamCheck = containsSpam(trimmedComment)
  if (spamCheck.isSpam) {
    throw new Error("Comment flagged as potential spam")
  }

  const duplicateCheck = await db
    .select({ id: commentsTable.id })
    .from(commentsTable)
    .where(eq(commentsTable.userId, userId))
    .orderBy(desc(commentsTable.createdAt))
    .limit(1)

  if (duplicateCheck.length > 0) {
    const lastComment = await db
      .select({ comment: commentsTable.comment })
      .from(commentsTable)
      .where(eq(commentsTable.id, duplicateCheck[0].id))

    if (lastComment.length > 0 && lastComment[0].comment === trimmedComment) {
      throw new Error("Duplicate comment detected")
    }
  }

  await db.insert(commentsTable).values({
    page: pageID,
    userId: user.id,
    comment: trimmedComment,
    createdAt: new Date(),
  })
  revalidatePath("/")
}
