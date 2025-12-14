import * as z from "zod";
import { createAgent, createMiddleware, HumanMessage, SystemMessage  } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatOpenAI } from "@langchain/openai"

export type AIAgent = "generalist" | "specialist" | "local";

export class AIAgentFactory {
    public static createAgent(agent: AIAgent): any {
        switch(agent) {
            case "generalist":
                return new GeneralistAgent();
            case "local":
                return new LocalGeneralistAgent();
        }
        throw new Error(`Agent ${agent} not found`);
    }
}

// export const messagesSchema = z.array(z.object({
//     role: z.enum(["system", "user", "assistant"]),
//     content: z.string(),
// }));

export class GeneralistAgent {
    public systemPrompt: string;
    public model: any;
    constructor() {
        this.systemPrompt = "You are a helpful assistant that answers questions about the user's prompt.";
        const freeModel = new ChatGoogleGenerativeAI({
            model: "models/gemini-flash-latest",
            temperature: 0,
            maxRetries: 2,
        })
        const agent = createAgent({
            model: freeModel,
            tools: [],
            prompt: this.systemPrompt,
          });
        this.model = agent;
    }

    public async invoke(messages: any[]): Promise<any> {
        const langchainMessages = messages.map(([role, content]: [string, string]) => {
            if (role === "human" || role === "user") {
                return { role: "user", content };
            }
            if (role === "assistant" || role === "ai") {
                return { role: "assistant", content };
            }
            // For other roles, default to user
            return { role: "user", content };
        })
        const response = await this.model.invoke({ messages: langchainMessages });
        return response;
    }

    public async stream(messages: any[]): Promise<ReadableStream> {
        const langchainMessages = messages.map(([role, content]: [string, string]) => {
            if (role === "human" || role === "user") {
                return { role: "user", content };
            }
            if (role === "assistant" || role === "ai") {
                return { role: "assistant", content };
            }
            // For other roles, default to user
            return { role: "user", content };
        })
        
        const stream = await this.model.stream({ messages: langchainMessages }, { streamMode: "values" });
        
        return new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const text = chunk?.messages?.[chunk.messages.length - 1]?.content || "";
                        if (text) {
                            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: text })}\n\n`));
                        }
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            }
        });
    }
}

/**
 * Local version of GeneralistAgent that uses AIStudio with gpt-oss-20b
 */
export class LocalGeneralistAgent extends GeneralistAgent {
    constructor() {
        super();
        // Override with local AIStudio model
        const localModel = new ChatOpenAI({
            model: "openai/gpt-oss-20b",
            temperature: 0,
            maxRetries: 2,
            configuration: {
                baseURL: process.env.AISTUDIO_BASE_URL || "http://localhost:8000/v1",
            },
            apiKey: process.env.AISTUDIO_API_KEY || "not-needed",
        });
        
        const agent = createAgent({
            model: localModel,
            tools: [],
            prompt: this.systemPrompt,
        });
        this.model = agent;
    }
}
