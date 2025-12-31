import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatOpenAI } from "@langchain/openai"
import { StringOutputParser } from "@langchain/core/output_parsers"
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  ToolMessage,
  BaseMessage,
} from "@langchain/core/messages"
import {
  langchainTools,
  searchEngineTool,
  queryGCSIMDatabaseTool,
  getInformationFromKnowledgeBaseTool,
  getInformationTool,
} from "./langchainTools"
import { BaseAgent } from "./BaseAgent"

// Execute tool by name
async function executeTool(name: string, args: any): Promise<string> {
  let result: any
  switch (name) {
    case "getInformation":
      result = await getInformationTool.invoke(args)
      break
    case "searchEngine":
      result = await searchEngineTool.invoke(args)
      break
    case "queryGCSIMDatabase":
      result = await queryGCSIMDatabaseTool.invoke(args)
      break
    case "getInformationFromKnowledgeBase":
      result = await getInformationFromKnowledgeBaseTool.invoke(args)
      break
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` })
  }
  // Ensure result is string
  return typeof result === "string" ? result : JSON.stringify(result)
}

export class GeneralistAgent extends BaseAgent {
  public systemPrompt: string
  protected parser: StringOutputParser
  protected tools: typeof langchainTools

  constructor() {
    super()
    this.systemPrompt =
      "You are an AI chatbot that answers questions about Genshin Impact. " +
      "Workflow: 1) If you need information, call getInformation ONCE. 2) After receiving results, immediately write your answer. " +
      "CRITICAL: You MUST always respond after calling a tool. Never stop without providing an answer. " +
      "Use the search results to inform your answer, then write a complete response to the user. " +
      "Format responses in GitHub markdown. " +
      "If a character name is unfamiliar, assume it's valid."
    this.parser = new StringOutputParser()
    this.tools = langchainTools
  }

  get model(): ChatGoogleGenerativeAI | ChatOpenAI {
    if (this.useLocalLLM) {
      return new ChatOpenAI({
        model: "openai/gpt-oss-20b",
        temperature: 0,
        maxRetries: 2,
        configuration: {
          baseURL: process.env.AISTUDIO_BASE_URL || "http://127.0.0.1:1234/v1",
        },
        apiKey: process.env.AISTUDIO_API_KEY || "not-needed",
      })
    } else {
      return new ChatGoogleGenerativeAI({
        model: "models/gemini-flash-latest",
        apiKey: process.env.AISTUDIO_GOOGLE_API_KEY,
        temperature: 0,
        maxRetries: 2,
      })
    }
  }

  /**
   * Stream with tool execution - calls tools and continues conversation
   */
  public async *streamRaw(
    messages: Array<[string, string]>
  ): AsyncGenerator<string> {
    const langchainMessages: BaseMessage[] = [
      new SystemMessage(this.systemPrompt),
      ...this.formatMessages(messages),
    ]
    const modelWithTools = this.model.bindTools(this.tools)

    // First call - may include tool calls
    const response = await modelWithTools.invoke(langchainMessages)

    // Check if model wants to call tools
    if (response.tool_calls && response.tool_calls.length > 0) {
      // Add assistant message with tool calls
      langchainMessages.push(response)

      // Execute each tool and add results
      for (const toolCall of response.tool_calls) {
        const result = await executeTool(toolCall.name, toolCall.args)
        langchainMessages.push(
          new ToolMessage({
            tool_call_id: toolCall.id || toolCall.name,
            content: result,
          })
        )
      }

      // Get final response with tool results
      const chain = modelWithTools.pipe(this.parser)
      const stream = await chain.stream(langchainMessages)

      for await (const chunk of stream) {
        yield chunk
      }
    } else {
      // No tool calls - stream directly
      const chain = this.model.pipe(this.parser)
      const stream = await chain.stream(langchainMessages)

      for await (const chunk of stream) {
        yield chunk
      }
    }
  }
}
