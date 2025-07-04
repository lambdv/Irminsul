import { generateResponse } from '@root/src/app/(main)/seelie/ai'
import { streamText } from 'ai'
import { getServerUser } from '@/lib/server-session'

export async function POST(req: Request) {
    const { messages } = await req.json()
    const user = await getServerUser()
    if(!user) 
        return new Response("Unauthorized", { status: 401 })
    const stream = await generateResponse("", user.id, messages)  as any
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    })
} 
