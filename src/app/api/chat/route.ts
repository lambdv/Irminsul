import { convertToModelMessages, UIMessage } from 'ai';
import { generateResponse } from '@/app/(main)/seelie/ai';

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages }: { messages: UIMessage[] } = await req.json()
        
        // Use AI SDK's generateResponse with reasoning middleware
        const result = generateResponse(
            '', // userId not needed for free model
            convertToModelMessages(messages)
        );
        
        return result.toUIMessageStreamResponse({
            sendReasoning: true,
        });
    }
    catch(e: any) {
        console.error('/api/chat error:', e)
        const message = e?.message ?? 'Unexpected error'
        return new Response(JSON.stringify({ error: message }), { status: 500 })
    }
}