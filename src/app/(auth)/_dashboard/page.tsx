import React from 'react'
import db from "@/db/db"
import { usersTable } from "@/db/schema/user"
import { commentsTable } from "@/db/schema/comment"
import { eq, sql, desc } from "drizzle-orm"
import Image from "next/image"
import { format } from "timeago.js"
import { getServerUser } from "@/lib/server-session"
import { isUserSupporterByEmail } from "@/app/(main)/support/actions"
import { redirect } from "next/navigation"

async function getUserStats(userId: string) {
  const stats = await db
    .select({
      commentCount: sql<number>`COUNT(${commentsTable.id})`,
      firstCommentDate: sql<Date>`MIN(${commentsTable.createdAt})`,
      lastCommentDate: sql<Date>`MAX(${commentsTable.createdAt})`,
    })
    .from(commentsTable)
    .where(eq(commentsTable.userId, userId))
    .groupBy(commentsTable.userId)

  return stats[0] || { commentCount: 0, firstCommentDate: null, lastCommentDate: null }
}

async function getRecentComments(userId: string, limit: number = 5) {
  const comments = await db
    .select({
      id: commentsTable.id,
      comment: commentsTable.comment,
      page: commentsTable.page,
      createdAt: commentsTable.createdAt,
    })
    .from(commentsTable)
    .where(eq(commentsTable.userId, userId))
    .orderBy(desc(commentsTable.createdAt))
    .limit(limit)

  return comments
}

export default async function DashboardPage() {
  const user = await getServerUser()
  
  if (!user) {
    redirect("/login")
  }

  const [userStats, recentComments, isSupporter] = await Promise.all([
    getUserStats(user.id),
    getRecentComments(user.id),
    isUserSupporterByEmail(user.email || "")
  ])

  const firstCommentDate = userStats.firstCommentDate ? new Date(userStats.firstCommentDate) : null
  const lastCommentDate = userStats.lastCommentDate ? new Date(userStats.lastCommentDate) : null

  return (
    <div className="min-h-screen ">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* User Profile Card */}
        <div className="">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Image
                src={user.image || "/imgs/icons/defaultavatar.png"}
                alt={user.name || "User"}
                width={80}
                height={80}
                className="rounded-full border-4 "
                unoptimized={true}
              />
              {user.id === "d4882fcc-8326-4fbb-8b32-d09c0fb86875" && (
                <div className="absolute -top-1 -right-1  rounded-full p-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-xl font-semibold ">
                  {user.name || "Anonymous"}
                </h2>
                {isSupporter && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ">
                    Supporter
                  </span>
                )}
              </div>
              <p className="text-sm">
                {user.email}
              </p>
              {firstCommentDate && (
                <p className="text-xs mt-1">
                  Member since {firstCommentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </div>
        <br />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Comments */}
          <div className=" dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium">Total Comments</p>
                <p className="text-2xl font-semibold">{userStats.commentCount}</p>
              </div>
            </div>
          </div>

          {/* First Comment */}
          <div className=" rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium">First Comment</p>
                <p className="text-lg font-semibold">
                  {firstCommentDate ? format(firstCommentDate) : "No comments yet"}
                </p>
              </div>
            </div>
          </div>

          {/* Last Activity */}
          <div className="e rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium">Last Activity</p>
                <p className="text-lg font-semibold">
                  {lastCommentDate ? format(lastCommentDate) : "No activity"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Comments */}
        <div className=" rounded-lg shadow-sm border ">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Recent Comments</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentComments.length > 0 ? (
              recentComments.map((comment) => (
                <div key={comment.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm mb-1">
                        {comment.comment.length > 100 
                          ? `${comment.comment.substring(0, 100)}...` 
                          : comment.comment
                        }
                      </p>
                      <div className="flex items-center space-x-4 text-xs">
                        <span>on {comment.page}</span>
                        <span>{format(new Date(comment.createdAt))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <div>
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg font-medium">No comments yet</p>
                  <p className="text-sm">Start commenting to see your activity here!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 