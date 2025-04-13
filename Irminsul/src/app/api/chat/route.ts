import { generateResponse } from '@/app/seelie/ai'
import { auth } from '@/app/(auth)/auth'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

// export const runtime = 'edge'

// export const maxDuration = 30;

export async function POST(req: Request) {
        
    const { messages } = await req.json()

    //TODO: check that userId exists as a user in the database and that they have a 
    const session = await auth()
    if(!session) return new Response("Unauthorized", { status: 401 })

    const lastMessage = messages[messages.length - 1]
    
    const stream = await generateResponse(lastMessage.content, session.user.id, messages)  as any
    
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    })

} 
