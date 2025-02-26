import { generateText, streamText, tool } from "ai";
import { getCharacterDataTool, getInformationTool } from "./tools";
import { eq, sql, and } from "drizzle-orm";
import db from "@/db/db";
import { aitokenTable } from "@/db/schema/aitoken";
import { usersTable } from "@/db/schema/user";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { getAiTokensLeft } from "./numAiTokensLeft";

// const token = process.env.GITHUB_TOKEN
// const endpoint = "https://models.inference.ai.azure.com"
// const modelName = "gpt-4o"

// const client = createOpenAI({
//     baseURL: endpoint,
//     apiKey: token
// })

// // Cast the model to resolve type conflicts
// const model = client(modelName) as any;


const token = process.env.AISTUDIO_GOOGLE_API_KEY
const google = createGoogleGenerativeAI({
    apiKey: token
  })

const model = google('gemini-2.0-flash') as any


const systemPrompt =  
    "You are an AI Assistant/agent chatbot that answers in-game and metagaming questions about the game Genshin Impact."
    + "You will answer questions based on the information provided in the knowledge base. To gain information about the game, use the getInformation tool. If you don't have the information, just say so."

export async function generateResponse(prompt: string, userId: string, messages?: any[]){




    const { textStream } = streamText({
        model,
        system: systemPrompt,
        tools:{
            get_information: getInformationTool,
            get_character_data: getCharacterDataTool
        },
        maxSteps: 5,
        messages: messages
    });

    //consume token
    const consumed = await consumeAiToken(userId)
    if(!consumed)
        return "You've run out of tokens. Please come back later!"

    console.log(textStream)

    return textStream
}




export async function consumeAiToken(userId: string, numTokens?: number){
    if(!numTokens)
        numTokens = 1

    const tokensLeft = await getAiTokensLeft(userId)
    if(tokensLeft < numTokens)
        return false

    const newTokensLeft: number = tokensLeft - numTokens
    await db
        .update(aitokenTable)
        .set({ numTokens: newTokensLeft })
        .where(eq(aitokenTable.userId, userId))


    return true
}

//for devlopment build
const lmstudio = createOpenAICompatible({
    name: 'lmstudio',
    baseURL: 'http://localhost:1234/v1',
});
const devModel = lmstudio('deepseek-coder-33b-instruct-pythagora-v3')