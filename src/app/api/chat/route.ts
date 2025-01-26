import { generateResponse } from '@/app/(content)/seelie/ai'

export const runtime = 'edge'

export async function POST(req: Request) {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]
    
    const stream = await generateResponse(lastMessage.content)
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    })
} 
