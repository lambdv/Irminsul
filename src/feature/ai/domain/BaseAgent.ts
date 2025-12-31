import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  BaseMessage,
} from "@langchain/core/messages"

export abstract class BaseAgent {
  protected useLocalLLM: boolean

  constructor() {
    this.useLocalLLM = process.env.USE_LOCAL_LLM === "true"
  }

  /**
   * Stream the agent's response as an async generator of strings
   */
  public abstract streamRaw(
    messages: Array<[string, string]>
  ): AsyncGenerator<string>

  /**
   * Format input messages from tuple format to LangChain BaseMessage format
   */
  protected formatMessages(messages: Array<[string, string]>): BaseMessage[] {
    const formatted: BaseMessage[] = []

    for (const [role, content] of messages) {
      if (role === "human" || role === "user") {
        formatted.push(new HumanMessage(content))
      } else if (role === "assistant" || role === "ai") {
        formatted.push(new AIMessage(content))
      } else if (role === "system") {
        formatted.push(new SystemMessage(content))
      }
    }

    return formatted
  }
}
