import { convertToModelMessages, UIMessage } from "ai"
import { generateResponse } from "@/app/(main)/seelie/ai"
import { getUserFromCookies } from "@/app/(auth)/actions"
import db from "@/db/db"
import { conversationTable } from "@/db/schema/conversation"
import { aimessageTable } from "@/db/schema/aimessage"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"

export const maxDuration = 30

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

    let currentConversationId = conversationId

    // Helper to extract content from UIMessage
    const getMessageContent = (message: UIMessage): string => {
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

    // If no conversationId provided, create a new conversation
    if (!currentConversationId) {
      const firstUserMessage = messages.find((m) => m.role === "user")
      const content = firstUserMessage
        ? getMessageContent(firstUserMessage)
        : ""
      const title = content
        ? content.slice(0, 50) + (content.length > 50 ? "..." : "")
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
    }

    // Store the user message if it's the last one
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role === "user") {
      const content = getMessageContent(lastMessage)
      await db.insert(aimessageTable).values({
        userId: user.id,
        conversationId: currentConversationId,
        role: "user",
        content,
      })
    }

    // Use AI SDK's generateResponse with reasoning middleware
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
