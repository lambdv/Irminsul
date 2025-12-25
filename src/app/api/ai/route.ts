import { AIAgentFactory } from "@root/src/feature/ai/AIAgentFactory"
import { createUIMessageStreamResponse, createUIMessageStream } from "ai"
import { BaseAgent } from "@root/src/feature/ai/BaseAgent"
import db from "@/db/db"
import { conversationTable } from "@/db/schema/conversation"
import { aimessageTable } from "@/db/schema/aimessage"
import { getUserFromCookies } from "@/app/(auth)/actions"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"

export const maxDuration = 200

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies()
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    const { messages, agentType = "agentic", conversationId } = await req.json()
    const langchainMessages = convertToLangChainFormat(messages)

    let currentConversationId = conversationId

    // Helper to extract content from AISDKMessage
    const getMessageContent = (message: AISDKMessage): string => {
      if (typeof message.content === "string") return message.content
      if (message.parts) {
        return message.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text || "")
          .join("")
      }
      return ""
    }

    // Ensure conversation exists - use provided ID or create new
    if (!currentConversationId) {
      // Fallback: create new if no ID provided (shouldn't happen with new client)
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
    } else {
      // Check if conversation exists, create if not
      const existing = await db
        .select()
        .from(conversationTable)
        .where(eq(conversationTable.id, currentConversationId))
        .limit(1)

      if (existing.length === 0) {
        // Create conversation with provided ID
        const firstUserMessage = messages.find((m) => m.role === "user")
        const content = firstUserMessage
          ? getMessageContent(firstUserMessage)
          : ""
        const title = content
          ? content.slice(0, 50) + (content.length > 50 ? "..." : "")
          : "New Chat"

        await db.insert(conversationTable).values({
          id: currentConversationId,
          userId: user.id,
          title,
        })
      }
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
      } as any)
    }

    let agent = AIAgentFactory.createAgent(agentType || "agentic")

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const messageId = `msg-${Date.now()}`
        let fullResponse = ""
        try {
          writer.write({ type: "text-start", id: messageId })

          const generator = agent.streamRaw(langchainMessages)
          let chunkCount = 0

          for await (const chunk of generator) {
            chunkCount++
            fullResponse += chunk
            writer.write({ type: "text-delta", id: messageId, delta: chunk })
          }

          console.log(`[API] Streamed ${chunkCount} chunks`)
          writer.write({ type: "text-end", id: messageId })

          // Store the assistant message
          await db.insert(aimessageTable).values({
            userId: user.id,
            conversationId: currentConversationId,
            role: "assistant",
            content: fullResponse,
          } as any)

          // Update conversation updatedAt
          await db
            .update(conversationTable)
            .set({ updatedAt: new Date() } as any)
            .where(eq(conversationTable.id, currentConversationId))
        } catch (error) {
          console.error("[API] Stream execute error:", error)
          writer.write({
            type: "text-delta",
            id: messageId,
            delta: "An error occurred while processing your request.",
          })
          writer.write({ type: "text-end", id: messageId })
        }
      },
      onError: (error) => {
        console.error("[API] Stream error:", error)
        return "An error occurred"
      },
    })
    return createUIMessageStreamResponse({ stream })
  } catch (e: any) {
    console.error("/api/ai error:", e)
    const message = e?.message ?? "Unexpected error"
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}

function convertToLangChainFormat(
  messages: AISDKMessage[]
): Array<[string, string]> {
  return messages.map((msg) => {
    let content = msg.content || ""
    if (msg.parts) {
      content = msg.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text || "")
        .join("")
    }
    return [msg.role, content] as [string, string]
  })
}

// Convert AI SDK message format to LangChain tuple format
type AISDKMessage = {
  role: "user" | "assistant" | "system"
  content?: string
  parts?: Array<{ type: string; text?: string }>
}
