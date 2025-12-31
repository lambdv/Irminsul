import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatOpenAI } from "@langchain/openai"
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  BaseMessage,
} from "@langchain/core/messages"
import {
  StateGraph,
  MessagesAnnotation,
  END,
  START,
  Annotation,
} from "@langchain/langgraph"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import { langchainTools } from "./langchainTools"
import { BaseAgent } from "./BaseAgent"

// Custom state that tracks thinking content separately
const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (curr, update) => [...curr, ...update],
    default: () => [],
  }),
  thinkingContent: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),
  toolResults: Annotation<string>({
    reducer: (curr, update) => curr + "\n" + update,
    default: () => "",
  }),
})

/**
 * Multi-Agent Pipeline using LangGraph
 * 1. Thinker Agent: Chain of thought reasoning + tool calling
 * 2. Synthesizer Agent: Clear, concise final response
 */
export class AgenticAgent extends BaseAgent {
  private graph: ReturnType<typeof this.buildGraph>
  private thinkerModel: ChatGoogleGenerativeAI | ChatOpenAI
  private synthesizerModel: ChatGoogleGenerativeAI | ChatOpenAI

  constructor() {
    super()
    if (this.useLocalLLM) {
      // Local LLM models
      this.thinkerModel = new ChatOpenAI({
        model: "openai/gpt-oss-20b",
        temperature: 0.3,
        maxRetries: 2,
        configuration: {
          baseURL: process.env.AISTUDIO_BASE_URL || "http://127.0.0.1:1234/v1",
        },
        apiKey: process.env.AISTUDIO_API_KEY || "not-needed",
      })

      this.synthesizerModel = new ChatOpenAI({
        model: "openai/gpt-oss-20b",
        temperature: 0,
        maxRetries: 2,
        maxTokens: 500,
        configuration: {
          baseURL: process.env.AISTUDIO_BASE_URL || "http://127.0.0.1:1234/v1",
        },
        apiKey: process.env.AISTUDIO_API_KEY || "not-needed",
      })
    } else {
      // Remote models
      this.thinkerModel = new ChatGoogleGenerativeAI({
        model: "models/gemini-flash-latest",
        apiKey: process.env.AISTUDIO_GOOGLE_API_KEY,
        temperature: 0.5, // Slightly creative for reasoning
        maxRetries: 2,
      })

      this.synthesizerModel = new ChatGoogleGenerativeAI({
        model: "models/gemini-flash-latest",
        apiKey: process.env.AISTUDIO_GOOGLE_API_KEY,
        temperature: 0, // Deterministic for clarity
        maxRetries: 2,
        maxOutputTokens: 500, // Limit response length
      })
    }

    this.graph = this.buildGraph()
  }

  private buildGraph() {
    const thinkerWithTools = this.thinkerModel.bindTools(langchainTools)
    const toolNode = new ToolNode(langchainTools)

    const thinkerPrompt = `You are a reasoning agent for Genshin Impact questions.
Your job is to THINK through the problem and gather information using tools.
Output your reasoning in a structured format:
1. What is the user asking?
2. What information do I need?
3. Should I use tools to search for current data?
4. My analysis and findings...

IMPORTANT: Assume all characters, weapons, artifacts, and game terms mentioned by the user are real and official unless you can't find from information sources otherwise.
Game data updates frequently, so even if something seems unfamiliar, treat it as valid and search for information about it.

If you need information, use the available tools. After gathering info, summarize your findings.
Do NOT provide the final answer - another agent will do that.
Focus on thorough reasoning and information gathering.
- you must not respond to questions out of scope of Genshin Impact. say something in a roleplay tone to say no information can be found in Teyvat or Irminsul about said subject.
`

    const synthesizerPrompt = `You are a genshin impact discord user who wants to help the user about a genshin imapct related question. write your response in a short and concise manner but be casual. 
    synthosize an answer to the user's question based on the reasoning and research from another agent.
RULES:
- Write clear, concise answers (aim for 100-300 words max)
- Use GitHub markdown formatting
- Be direct and actionable
- result should be less than 200 words long
- first sentence should answer the user's question directly
- do not include any thinking or reasoning - just the polished answer
`

    // Thinker node - reasons and calls tools
    const thinkerNode = async (state: typeof AgentState.State) => {
      const { messages } = state

      const messagesWithSystem = [new SystemMessage(thinkerPrompt), ...messages]

      console.log("[Thinker] Starting reasoning...")
      const response = await thinkerWithTools.invoke(messagesWithSystem)

      // Extract thinking content (:::thinking ... :::)
      const content =
        typeof response.content === "string" ? response.content : ""
      const thinkMatch = content.match(/:::thinking\n?([\s\S]*?):::/i)
      const thinkingContent = thinkMatch ? thinkMatch[1].trim() : content

      if (response.tool_calls && response.tool_calls.length > 0) {
        console.log(
          "[Thinker] Tool calls:",
          response.tool_calls.map((t) => t.name)
        )
      }

      return {
        messages: [response],
        thinkingContent: thinkingContent,
      }
    }

    // Route after thinker - tools or synthesizer
    const afterThinker = (state: typeof AgentState.State) => {
      const { messages } = state
      const lastMessage = messages[messages.length - 1] as AIMessage

      console.log("[Router] Checking route after thinker...")
      console.log("[Router] Last message type:", lastMessage?._getType?.())
      console.log("[Router] Tool calls:", lastMessage?.tool_calls?.length ?? 0)

      if (lastMessage?.tool_calls && lastMessage.tool_calls.length > 0) {
        console.log("[Router] -> Routing to tools")
        return "tools"
      }
      console.log("[Router] -> Routing to synthesizer")
      return "synthesizer"
    }

    // Capture tool results
    const captureToolResults = async (state: typeof AgentState.State) => {
      const { messages } = state
      // Get the last few messages which should be tool results
      const toolMessages = messages.filter((m) => m._getType() === "tool")
      const results = toolMessages
        .map((m) =>
          typeof m.content === "string" ? m.content : JSON.stringify(m.content)
        )
        .join("\n---\n")

      return { toolResults: results }
    }

    // Synthesizer node - creates final response
    const synthesizerNode = async (state: typeof AgentState.State) => {
      console.log("[Synthesizer] Node entered")
      const { messages, thinkingContent, toolResults } = state

      // Get original user question
      const userMessages = messages.filter((m) => m._getType() === "human")
      const userQuestion =
        userMessages.length > 0
          ? typeof userMessages[userMessages.length - 1].content === "string"
            ? userMessages[userMessages.length - 1].content
            : ""
          : ""

      console.log("[Synthesizer] User question:", userQuestion)
      console.log(
        "[Synthesizer] Thinking content length:",
        thinkingContent?.length ?? 0
      )

      const contextMessage = `
USER QUESTION: ${userQuestion}

RESEARCH & REASONING FROM THINKER AGENT:
${thinkingContent}

${toolResults ? `TOOL RESULTS:\n${toolResults}` : ""}

Now write the final, polished response for the user.`

      console.log("[Synthesizer] Generating final response...")
      try {
        const response = await this.synthesizerModel.invoke([
          new SystemMessage(synthesizerPrompt),
          new HumanMessage(contextMessage),
        ])

        // Combine thinking + final response for streaming
        const finalContent =
          (thinkingContent ? `<think>${thinkingContent}</think>\n\n` : "") +
          (typeof response.content === "string" ? response.content : "")

        console.log(
          "[Synthesizer] Response generated, length:",
          finalContent.length
        )

        return {
          messages: [new AIMessage(finalContent)],
        }
      } catch (error) {
        console.error("[Synthesizer] Error:", error)
        throw error
      }
    }

    // Build the graph
    const workflow = new StateGraph(AgentState)
      .addNode("thinker", thinkerNode)
      .addNode("tools", toolNode)
      .addNode("captureTools", captureToolResults)
      .addNode("synthesizer", synthesizerNode)
      .addEdge(START, "thinker")
      .addConditionalEdges("thinker", afterThinker, ["tools", "synthesizer"])
      .addEdge("tools", "captureTools")
      .addEdge("captureTools", "thinker") // Back to thinker after tools
      .addEdge("synthesizer", END)

    return workflow.compile()
  }

  /**
   * Stream the agent's response with token-by-token streaming
   */
  public async *streamRaw(
    messages: Array<[string, string]>
  ): AsyncGenerator<string> {
    const formattedMessages = this.formatMessages(messages)

    try {
      const eventStream = this.graph.streamEvents(
        { messages: formattedMessages },
        { version: "v2", recursionLimit: 15 }
      )

      let hasYielded = false
      let inThinkerNode = false
      let hasStartedThinking = false

      for await (const event of eventStream) {
        // Track when we enter the thinker node
        if (event.event === "on_chain_start" && event.name === "thinker") {
          inThinkerNode = true
        }

        // Track when we leave the thinker node
        if (event.event === "on_chain_end" && event.name === "thinker") {
          if (hasStartedThinking) {
            yield ":::"
            hasStartedThinking = false
          }
          inThinkerNode = false
        }

        // Stream tokens from any chat model
        if (event.event === "on_chat_model_stream") {
          const chunk = event.data?.chunk
          if (chunk?.content && typeof chunk.content === "string") {
            hasYielded = true
            // Only wrap thinker content, not synthesizer
            if (inThinkerNode) {
              if (!hasStartedThinking) {
                yield ":::thinking\n"
                hasStartedThinking = true
              }
              yield chunk.content
            } else {
              yield chunk.content
            }
          }
        }

        // Catch errors in chain
        if (event.event === "on_chain_error") {
          console.error("[Graph] Error:", event.data)
        }
      }

      if (!hasYielded) {
        console.log("[Graph] Warning: No content was streamed")
        yield "I apologize, but I couldn't generate a response. Please try again."
      }
    } catch (error) {
      console.error("[Graph] Stream error:", error)
      yield "An error occurred while processing your request."
    }
  }
}
