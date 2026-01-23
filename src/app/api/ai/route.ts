import { AIAgentFactory } from "@root/src/feature/ai/domain/AIAgentFactory"
import { createUIMessageStreamResponse, createUIMessageStream } from "ai"
import db from "@/db/db"
import { conversationTable } from "@/db/schema/conversation"
import { aimessageTable } from "@/db/schema/aimessage"
import { getUserFromCookies } from "@/app/(auth)/actions"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { z } from "zod"
import {
  consumeAiTokens,
  getAiTokensLeft,
} from "@root/src/feature/ai/utils/numAiTokensLeft"

const MAX_MESSAGE_LENGTH = 8000
const MAX_MESSAGES_PER_REQUEST = 50
const MAX_CONVERSATION_MESSAGES = 100
const MAX_TITLE_LENGTH = 100

const aiRequestSchema = z
  .object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant", "system"]),
          content: z.string().optional(),
          parts: z
            .array(
              z.object({
                type: z.string(),
                text: z.string().optional(),
              })
            )
            .optional(),
        })
      )
      .min(1)
      .max(MAX_MESSAGES_PER_REQUEST),
    agentType: z.string().optional(),
    conversationId: z.string().optional(),
  })
  .transform((data) => ({
    ...data,
    messages: data.messages as AISDKMessage[],
  }))

function getMessageContent(message: AISDKMessage): string {
  if (typeof message.content === "string") return message.content
  if (message.parts) {
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text || "")
      .join("")
  }
  return ""
}

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

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies()
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    const body = await req.json()
    const validation = aiRequestSchema.safeParse(body)
    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: "Validation failed",
        }),
        { status: 400 }
      )
    }

    const { messages, agentType, conversationId } = validation.data

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

    const langchainMessages = convertToLangChainFormat(messages)

    const tokensLeft = await getAiTokensLeft(user.id)
    if (tokensLeft <= 0) {
      return new Response(
        JSON.stringify({
          error: "Insufficient AI tokens. Please purchase more.",
        }),
        { status: 402 }
      )
    }

    const consumed = await consumeAiTokens(user.id, 1)
    if (!consumed) {
      return new Response(
        JSON.stringify({ error: "Failed to consume AI tokens" }),
        { status: 500 }
      )
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
      } as any)
    }

    let agent = AIAgentFactory.createAgent((agentType as any) || "generalist")

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
            if (chunkCount > 1000) {
              writer.write({
                type: "text-delta",
                id: messageId,
                delta: "\n\n[Response truncated for length]",
              })
              break
            }
            fullResponse += chunk
            writer.write({ type: "text-delta", id: messageId, delta: chunk })
          }

          console.log(`[API] Streamed ${chunkCount} chunks`)
          writer.write({ type: "text-end", id: messageId })

          if (fullResponse.length > 10000) {
            fullResponse =
              fullResponse.slice(0, 10000) +
              "\n\n[Response truncated for length]"
          }

          await db.insert(aimessageTable).values({
            userId: user.id,
            conversationId: currentConversationId,
            role: "assistant",
            content: fullResponse,
          } as any)

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

type AISDKMessage = {
  role: "user" | "assistant" | "system"
  content?: string
  parts?: Array<{ type: string; text?: string }>
}
