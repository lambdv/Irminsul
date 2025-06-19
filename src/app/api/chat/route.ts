import { generateResponse } from '@/app/seelie/ai'
import { auth } from '@/app/(auth)/auth'
import { streamText } from 'ai'

export async function POST(req: Request) {
    const { messages } = await req.json()
    const session = await auth()
    if(!session) 
        return new Response("Unauthorized", { status: 401 })
    const stream = await generateResponse("", session.user.id, messages)  as any
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    })
} 
