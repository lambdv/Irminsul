import * as z from "zod";
import { createAgent, createMiddleware  } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { AIAgentFactory, AIAgent} from "@root/src/feature/ai/AIAgentFactory"

export async function POST(req: Request) {
    const { messages } = await req.json()
    try{
        const agent = AIAgentFactory.createAgent("local");
        const stream = await agent.stream(messages)
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        })
    }
    catch(e: any){
        console.error('/api/ai error:', e)
        const message = e?.message ?? 'Unexpected error'
        return new Response(JSON.stringify({ error: message }), { status: 500 })
    }

    // try{
    //     const { messages, model } = await req.json()
    //     const user = await getServerUser()
    //     const selectedModel = (typeof model === 'string' && availableModels.includes(model)) ? model : 'auto'

    //     if(selectedModel !== 'auto'){
    //         if(!user){
    //             return new Response(JSON.stringify({ error: 'You must be logged in to use this model.' }), { status: 401 })
    //         }
    //         const ok = await consumeAiToken(user.id)
    //         if(!ok){
    //             return new Response(JSON.stringify({ error: 'Out of tokens. Please try again later.' }), { status: 402 })
    //         }
    //     }

    //     const stream = await generateResponse("", user?.id ?? "", messages, selectedModel)  as any
    //     return new Response(stream, {
    //         headers: {
    //             'Content-Type': 'text/event-stream',
    //             'Cache-Control': 'no-cache',
    //             'Connection': 'keep-alive',
    //         },
    //     })
    // }
    // catch(e: any){
    //     console.error('/api/chat error:', e)
    //     const message = e?.message ?? 'Unexpected error'
    //     return new Response(JSON.stringify({ error: message }), { status: 500 })
    // }
} 
