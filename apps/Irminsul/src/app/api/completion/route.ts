import { generateCompletion, generateResponse } from '@/app/seelie/ai'
import { auth } from '@/app/(auth)/auth'
import { streamText } from 'ai'

// export const runtime = 'edge'

// export const maxDuration = 30;

export async function POST(req: Request) {
    const { text } = await req.json()
    const completion = await generateCompletion(text)

    console.log(completion)

    return new Response(completion, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    })

} 
