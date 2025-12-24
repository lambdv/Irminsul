import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation, END, START, Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { langchainTools } from "./langchainTools";

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
});

/**
 * Multi-Agent Pipeline using LangGraph
 * 1. Thinker Agent: Chain of thought reasoning + tool calling
 * 2. Synthesizer Agent: Clear, concise final response
 */
export class AgenticAgent {
    private graph: ReturnType<typeof this.buildGraph>;
    private thinkerModel: ChatGoogleGenerativeAI;
    private synthesizerModel: ChatGoogleGenerativeAI;

    constructor() {
        // Thinker model - can call tools
        this.thinkerModel = new ChatGoogleGenerativeAI({
            model: "models/gemini-flash-latest",
            apiKey: process.env.AISTUDIO_GOOGLE_API_KEY,
            temperature: 0.3, // Slightly creative for reasoning
            maxRetries: 2,
        });

        // Synthesizer model - focused on clear output
        this.synthesizerModel = new ChatGoogleGenerativeAI({
            model: "models/gemini-flash-latest",
            apiKey: process.env.AISTUDIO_GOOGLE_API_KEY,
            temperature: 0, // Deterministic for clarity
            maxRetries: 2,
        });

        this.graph = this.buildGraph();
    }

    private buildGraph() {
        const thinkerWithTools = this.thinkerModel.bindTools(langchainTools);
        const toolNode = new ToolNode(langchainTools);

        const thinkerPrompt = `You are a reasoning agent for Genshin Impact questions.
Your job is to THINK through the problem and gather information using tools.

IMPORTANT: Assume all characters, weapons, artifacts, and game terms mentioned by the user are real and official unless you can't find from information sources otherwise.
Game data updates frequently, so even if something seems unfamiliar, treat it as valid and search for information about it.

ALWAYS output your reasoning wrapped in these exact markers:
:::thinking
1. What is the user asking?
2. What information do I need?
3. Should I use tools to search for current data?
4. My analysis and findings...
:::

If you need information, use the available tools. After gathering info, summarize your findings.
Do NOT provide the final answer - another agent will do that.
Focus on thorough reasoning and information gathering.`;

        const synthesizerPrompt = `You are a response synthesizer for Genshin Impact.
You receive reasoning and research from another agent, and your job is to write the FINAL RESPONSE.

RULES:
- Write a clear, concise, and helpful answer
- Use GitHub markdown formatting
- Be direct and actionable
- Cite sources when relevant
- Do NOT include any thinking or reasoning - just the polished answer
- Structure with headers, bullets, or numbered lists as appropriate`;

        // Thinker node - reasons and calls tools
        const thinkerNode = async (state: typeof AgentState.State) => {
            const { messages } = state;
            
            const messagesWithSystem = [
                new SystemMessage(thinkerPrompt),
                ...messages,
            ];
            
            console.log("[Thinker] Starting reasoning...");
            const response = await thinkerWithTools.invoke(messagesWithSystem);
            
            // Extract thinking content (:::thinking ... :::)
            const content = typeof response.content === 'string' ? response.content : '';
            const thinkMatch = content.match(/:::thinking\n?([\s\S]*?):::/i);
            const thinkingContent = thinkMatch ? thinkMatch[1].trim() : content;
            
            if (response.tool_calls && response.tool_calls.length > 0) {
                console.log("[Thinker] Tool calls:", response.tool_calls.map(t => t.name));
            }
            
            return { 
                messages: [response],
                thinkingContent: thinkingContent,
            };
        };

        // Route after thinker - tools or synthesizer
        const afterThinker = (state: typeof AgentState.State) => {
            const { messages } = state;
            const lastMessage = messages[messages.length - 1] as AIMessage;
            
            console.log("[Router] Checking route after thinker...");
            console.log("[Router] Last message type:", lastMessage?._getType?.());
            console.log("[Router] Tool calls:", lastMessage?.tool_calls?.length ?? 0);
            
            if (lastMessage?.tool_calls && lastMessage.tool_calls.length > 0) {
                console.log("[Router] -> Routing to tools");
                return "tools";
            }
            console.log("[Router] -> Routing to synthesizer");
            return "synthesizer";
        };

        // Capture tool results
        const captureToolResults = async (state: typeof AgentState.State) => {
            const { messages } = state;
            // Get the last few messages which should be tool results
            const toolMessages = messages.filter(m => m._getType() === "tool");
            const results = toolMessages.map(m => 
                typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
            ).join("\n---\n");
            
            return { toolResults: results };
        };

        // Synthesizer node - creates final response
        const synthesizerNode = async (state: typeof AgentState.State) => {
            console.log("[Synthesizer] Node entered");
            const { messages, thinkingContent, toolResults } = state;
            
            // Get original user question
            const userMessages = messages.filter(m => m._getType() === "human");
            const userQuestion = userMessages.length > 0 
                ? (typeof userMessages[userMessages.length - 1].content === 'string' 
                    ? userMessages[userMessages.length - 1].content 
                    : '')
                : '';
            
            console.log("[Synthesizer] User question:", userQuestion);
            console.log("[Synthesizer] Thinking content length:", thinkingContent?.length ?? 0);
            
            const contextMessage = `
USER QUESTION: ${userQuestion}

RESEARCH & REASONING FROM THINKER AGENT:
${thinkingContent}

${toolResults ? `TOOL RESULTS:\n${toolResults}` : ''}

Now write the final, polished response for the user.`;

            console.log("[Synthesizer] Generating final response...");
            try {
                const response = await this.synthesizerModel.invoke([
                    new SystemMessage(synthesizerPrompt),
                    new HumanMessage(contextMessage),
                ]);
                
                // Combine thinking + final response for streaming
                const thinkingBlock = thinkingContent ? `:::thinking\n${thinkingContent}\n:::\n\n` : '';
                const finalContent = thinkingBlock + (typeof response.content === 'string' ? response.content : '');
                
                console.log("[Synthesizer] Response generated, length:", finalContent.length);
                
                return { 
                    messages: [new AIMessage(finalContent)],
                };
            } catch (error) {
                console.error("[Synthesizer] Error:", error);
                throw error;
            }
        };

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
            .addEdge("synthesizer", END);

        return workflow.compile();
    }

    /**
     * Stream the agent's response with token-by-token streaming
     */
    public async streamRaw(messages: Array<[string, string]>) {
        const formattedMessages = this.formatMessages(messages);
        
        const self = this;
        async function* streamGenerator(): AsyncGenerator<string> {
            try {
                const eventStream = self.graph.streamEvents(
                    { messages: formattedMessages },
                    { version: "v2", recursionLimit: 15 }
                );
                
                let hasYielded = false;
                
                for await (const event of eventStream) {
                    // Log events for debugging
                    if (event.event === "on_chain_start" || event.event === "on_chain_end") {
                        console.log(`[Graph] ${event.event}: ${event.name}`);
                    }
                    
                    // Stream tokens from any chat model
                    if (event.event === "on_chat_model_stream") {
                        const chunk = event.data?.chunk;
                        if (chunk?.content && typeof chunk.content === 'string') {
                            hasYielded = true;
                            yield chunk.content;
                        }
                    }
                    
                    // Catch errors in chain
                    if (event.event === "on_chain_error") {
                        console.error("[Graph] Error:", event.data);
                    }
                }
                
                if (!hasYielded) {
                    console.log("[Graph] Warning: No content was streamed");
                    yield "I apologize, but I couldn't generate a response. Please try again.";
                }
            } catch (error) {
                console.error("[Graph] Stream error:", error);
                yield "An error occurred while processing your request.";
            }
        }
        
        return streamGenerator();
    }

    private formatMessages(messages: Array<[string, string]>): BaseMessage[] {
        const formatted: BaseMessage[] = [];
        
        for (const [role, content] of messages) {
            if (role === "human" || role === "user") {
                formatted.push(new HumanMessage(content));
            } else if (role === "assistant" || role === "ai") {
                formatted.push(new AIMessage(content));
            } else if (role === "system") {
                formatted.push(new SystemMessage(content));
            }
        }
        
        return formatted;
    }
}
