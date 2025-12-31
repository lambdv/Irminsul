import {
  streamText,
  stepCountIs,
  wrapLanguageModel,
  extractReasoningMiddleware,
} from "ai"
import { tools } from "../tools/tools"
import { eq } from "drizzle-orm"
import db from "@/db/db"
import { aitokenTable } from "@/db/schema/aitoken"
import { aimessageTable } from "@/db/schema/aimessage"
import { conversationTable } from "@/db/schema/conversation"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createOpenAI } from "@ai-sdk/openai"
import { getAiTokensLeft } from "../utils/numAiTokensLeft"

const google = createGoogleGenerativeAI({
  apiKey: process.env.AISTUDIO_GOOGLE_API_KEY,
})

// OpenAI-compatible provider (for local servers like LM Studio, Ollama, etc.)
const openaiCompatible = createOpenAI({
  baseURL: process.env.AISTUDIO_BASE_URL || "http://127.0.0.1:1234/v1",
  apiKey: process.env.AISTUDIO_API_KEY || "not-needed",
})

// Base model for regular use
//const model = google('models/gemini-2.5-flash') //NEVER TOUCH THIS MODEL, IT IS THE FREE MODEL

const model = google("models/gemini-flash-latest")
//model = openaiCompatible.chat('openai/gpt-oss-20b') as any
// const model = openaiCompatible('openai/gpt-oss-20b') // Use this for local/custom OpenAI-compatible server

// const freeModel = wrapLanguageModel({
//     model: baseModel as any,
//     middleware: extractReasoningMiddleware({
//         tagName: 'think',
//         startWithReasoning: true,
//     }),
// })

// Re-export for backward compatibility (server-side only usage)
export { availableModels } from "../utils/models"

const systemPrompt =
  "You are an AI chatbot that answers questions about Genshin Impact. " +
  "Workflow: 1) If you need information, call getInformationTool ONCE. 2) After receiving results, immediately write your answer. " +
  "CRITICAL: You MUST always respond after calling a tool. Never stop without providing an answer. " +
  "Use the search results to inform your answer, then write a complete response to the user. " +
  "Format responses in GitHub markdown. " +
  "If a character name is unfamiliar, assume it's valid."

/**
 * Generate an AI response stream for a given prompt
 * @param userId user id to consume tokens from
 * @param conversationId conversation id
 * @param messages conversation messages
 * @returns streamText result for use with toDataStreamResponse
 */
export function generateResponse(
  userId: string,
  conversationId: string,
  messages: any[]
) {
  return streamText({
    messages: messages,
    // Use .chat() to explicitly use Chat Completions API (/v1/chat/completions)
    // instead of the default Responses API (/v1/responses)
    model: model as any,
    system: systemPrompt,
    tools: tools as any,
    stopWhen: stepCountIs(5), // Allow multiple steps: tool call + response generation
    onStepFinish: (step) => {
      // Log to debug tool execution
      if (step.toolCalls && step.toolCalls.length > 0) {
        console.log(
          "Tool called:",
          step.toolCalls.map((t) => t.toolName)
        )
      }
      if (step.text) {
        console.log("Model response after tool:", step.text.substring(0, 100))
      }
    },
    onFinish: async (result) => {
      const response = result.text
      const inputTokens = result.usage.inputTokens || 0
      const outputTokens = result.usage.outputTokens || 0
      const totalTokens = inputTokens + outputTokens

      try {
        // Consume tokens
        const consumed = await consumeAiToken(userId, totalTokens)
        if (!consumed) {
          console.warn("Failed to consume AI tokens for user:", userId)
        }

        // Store the assistant message
        await db.insert(aimessageTable).values({
          userId,
          conversationId,
          role: "assistant",
          content: response,
        })
      } catch (error) {
        console.error("Failed to store AI message:", error)
      }
    },
  })
}

/**
 * remove number of tokens from the user's account if they have enough tokens
 * if they don't have enough tokens, return false and don't remove any tokens
 * @param userId
 * @param numTokens
 * @returns
 */
export async function consumeAiToken(
  userId: string,
  numTokens: number = 1
): Promise<boolean> {
  const tokensLeft = await getAiTokensLeft(userId)
  if (tokensLeft < numTokens) return false

  const newTokensLeft: number = tokensLeft - numTokens
  await db
    .update(aitokenTable)
    .set({ numTokens: newTokensLeft } as any)
    .where(eq(aitokenTable.userId, userId))
  return true
}
