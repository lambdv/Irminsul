import { AIAgentFactory } from "@root/src/feature/ai/AIAgentFactory";
import { toUIMessageStream } from "@ai-sdk/langchain";
import { createUIMessageStreamResponse, createUIMessageStream } from "ai";
import { AgenticAgent } from "@root/src/feature/ai/AgenticAgent";

// Allow streaming responses up to 60 seconds for multi-agent pipeline
export const maxDuration = 60;

// Convert AI SDK message format to LangChain tuple format
type AISDKMessage = {
    role: 'user' | 'assistant' | 'system';
    content?: string;
    parts?: Array<{ type: string; text?: string }>;
};

function convertToLangChainFormat(messages: AISDKMessage[]): Array<[string, string]> {
    return messages.map(msg => {
        let content = msg.content || '';
        if (msg.parts) {
            content = msg.parts
                .filter(part => part.type === 'text')
                .map(part => part.text || '')
                .join('');
        }
        return [msg.role, content] as [string, string];
    });
}

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()
        const langchainMessages = convertToLangChainFormat(messages);
        
        // Use agentic agent with LangGraph pipeline
        const agent = AIAgentFactory.createAgent("agentic");
        
        // AgenticAgent returns AsyncGenerator, handle differently
        if (agent instanceof AgenticAgent) {
            const stream = createUIMessageStream({
                execute: async ({ writer }) => {
                    const messageId = `msg-${Date.now()}`;
                    try {
                        writer.write({ type: 'text-start', id: messageId });
                        
                        const generator = await agent.streamRaw(langchainMessages);
                        let chunkCount = 0;
                        
                        for await (const chunk of generator) {
                            chunkCount++;
                            writer.write({ type: 'text-delta', id: messageId, delta: chunk });
                        }
                        
                        console.log(`[API] Streamed ${chunkCount} chunks`);
                        writer.write({ type: 'text-end', id: messageId });
                    } catch (error) {
                        console.error('[API] Stream execute error:', error);
                        writer.write({ type: 'text-delta', id: messageId, delta: 'An error occurred while processing your request.' });
                        writer.write({ type: 'text-end', id: messageId });
                    }
                },
                onError: (error) => {
                    console.error('[API] Stream error:', error);
                    return 'An error occurred';
                }
            });
            return createUIMessageStreamResponse({ stream });
        }
        
        // GeneralistAgent returns LangChain stream
        const stream = await agent.streamRaw(langchainMessages);
        return createUIMessageStreamResponse({
            stream: toUIMessageStream(stream),
        });
    }
    catch(e: any){
        console.error('/api/ai error:', e)
        const message = e?.message ?? 'Unexpected error'
        return new Response(JSON.stringify({ error: message }), { status: 500 })
    }
} 
