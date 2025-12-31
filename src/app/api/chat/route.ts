import { convertToModelMessages, UIMessage } from "ai"
import { generateResponse } from "@/feature/ai/actions/ai"
import { getUserFromCookies } from "@/app/(auth)/actions"
import db from "@/db/db"
import { conversationTable } from "@/db/schema/conversation"
import { aimessageTable } from "@/db/schema/aimessage"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"

export const maxDuration = 30

const MAX_MESSAGE_LENGTH = 8000
const MAX_MESSAGES_PER_REQUEST = 50
const MAX_CONVERSATION_MESSAGES = 100
const MAX_TITLE_LENGTH = 100

function sanitizeContent(content: string): string {
  const dangerousPatterns = [
    /<script[\s>]/gi,
    /javascript:/gi,
    /on\w+=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /expression\s*\(/gi,
  ]
  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      return "[content removed for security]"
    }
  }
  return content.slice(0, MAX_MESSAGE_LENGTH)
}

function getMessageContent(message: UIMessage): string {
  const msg = message as any
  if (typeof msg.content === "string") return msg.content
  if (msg.parts) {
    return msg.parts
      .filter((p: any) => p?.type === "text" && typeof p?.text === "string")
      .map((p: any) => p.text)
      .join("")
  }
  return ""
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies()
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    const {
      messages,
      conversationId,
    }: { messages: UIMessage[]; conversationId?: string } = await req.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
      })
    }

    if (messages.length > MAX_MESSAGES_PER_REQUEST) {
      return new Response(
        JSON.stringify({
          error: `Too many messages. Maximum ${MAX_MESSAGES_PER_REQUEST} per request.`,
        }),
        { status: 400 }
      )
    }

    for (const msg of messages) {
      const content = getMessageContent(msg)
      if (content.length > MAX_MESSAGE_LENGTH) {
        return new Response(
          JSON.stringify({
            error: `Message content exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`,
          }),
          { status: 400 }
        )
      }
    }

    let currentConversationId = conversationId

    if (!currentConversationId) {
      const firstUserMessage = messages.find((m) => m.role === "user")
      const content = firstUserMessage
        ? sanitizeContent(getMessageContent(firstUserMessage))
        : ""
      const title = content
        ? sanitizeContent(content).slice(0, MAX_TITLE_LENGTH) +
          (content.length > MAX_TITLE_LENGTH ? "..." : "")
        : "New Chat"

      const [conversation] = await db
        .insert(conversationTable)
        .values({
          id: nanoid(),
          userId: user.id,
          title,
        })
        .returning()
      currentConversationId = conversation.id
    } else {
      const existing = await db
        .select()
        .from(conversationTable)
        .where(eq(conversationTable.id, currentConversationId))
        .limit(1)

      if (existing.length === 0) {
        const firstUserMessage = messages.find((m) => m.role === "user")
        const content = firstUserMessage
          ? sanitizeContent(getMessageContent(firstUserMessage))
          : ""
        const title = content
          ? sanitizeContent(content).slice(0, MAX_TITLE_LENGTH) +
            (content.length > MAX_TITLE_LENGTH ? "..." : "")
          : "New Chat"

        await db.insert(conversationTable).values({
          id: currentConversationId,
          userId: user.id,
          title,
        })
      } else if (existing[0].userId !== user.id) {
        return new Response(
          JSON.stringify({ error: "Conversation not found" }),
          { status: 404 }
        )
      }
    }

    const existingMessagesCount = await db
      .select({ count: aimessageTable.id })
      .from(aimessageTable)
      .where(eq(aimessageTable.conversationId, currentConversationId))

    if (existingMessagesCount.length >= MAX_CONVERSATION_MESSAGES) {
      return new Response(
        JSON.stringify({
          error:
            "Conversation has reached maximum message limit. Please start a new conversation.",
        }),
        { status: 400 }
      )
    }

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role === "user") {
      const content = sanitizeContent(getMessageContent(lastMessage))
      await db.insert(aimessageTable).values({
        userId: user.id,
        conversationId: currentConversationId,
        role: "user",
        content,
      })
    }

    const result = generateResponse(
      user.id,
      currentConversationId,
      convertToModelMessages(messages)
    )

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
    })
  } catch (e: any) {
    console.error("/api/chat error:", e)
    const message = e?.message ?? "Unexpected error"
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}
