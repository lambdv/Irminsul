import { generateText, streamText, tool } from "ai";
import { z } from 'zod';
import { getCharacterDataTool, getInformationTool } from "./tools";
import { findRelevantContent } from '@/lib/ai/embedding';
import { eq, sql, and } from "drizzle-orm";
import db from "@/db/db";
import { aitokenTable } from "@/db/schema/aitoken";
import { purchasesTable } from "@/db/schema/purchase";
import { usersTable } from "@/db/schema/user";
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const token = process.env.GITHUB_TOKEN
const endpoint = "https://models.inference.ai.azure.com"
const modelName = "gpt-4o"

const client = createOpenAI({
    baseURL: endpoint,
    apiKey: token
})

// Cast the model to resolve type conflicts
const model = client(modelName) as any;

const systemPrompt =  
    "You are an AI Assistant/agent chatbot that answers questions about the game Genshin Impact. Including both in game and metagaming questions"
    + "You will answer questions based on the information provided in the knowledge base. To gain information about the game, use the getInformation tool. If you don't have the information, just say so."
    + "You will also use the getCharacterData tool to get information about characters. This is important because the character data is the most important information you need to answer the question."

export async function generateResponse(prompt: string, userId: string, messages?: any[]){
    // if((prompt.length <= 0))
    //     return ""

    //const tokensLeft = await getAiTokensLeft(userId)
    // if(tokensLeft <= 0){
    //     return "You've run out of tokens. Please come back later!"
    // }

    // const { textStream } = streamText({
    //     model,
    //     system: systemPrompt,
    //     //prompt: "you have to use the \"getInformation(question: string)\" tool (passing in the user's question to get info from your knowledge base) to awnser the following question: " + prompt,
    //     tools:{
    //         getCharacterData: getCharacterDataTool,
    //         getInformation: getInformationTool,
    //     },
    //     maxSteps: 20,
    //     messages: messages
    // });

    const response = await generateText({
        model,
        system: systemPrompt,
        tools:{
            getCharacterData: getCharacterDataTool,
            getInformation: getInformationTool,
        },
        maxSteps: 10,
        messages: messages
    })

    console.log(response)

    ///const consumeToken = await consumeAiToken(userId)
    // if(!consumeToken){
    //     throw new Error("You've run out of tokens. Please come back later!")
    //     //return "You've run out of tokens. Please come back later!"
    // }

    return response
}

export async function getAiTokensLeft(userId: string){
    

    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId))
    if(user.length <= 0)
        return 0

    const tokenRecord = await db.select().from(aitokenTable).where(eq(aitokenTable.userId, userId))
    //if there is a record, return the numTokens
    if(tokenRecord.length > 0 && user[0].email){
        let numTokens = tokenRecord[0].numTokens

        const numPurchases = await db.select()
            .from(purchasesTable)
            .where(eq(purchasesTable.email, user[0].email))
        

        if(numPurchases.length > 0){
            numTokens += numPurchases.length * 500
        }
        
        return Math.max(numTokens, 0)
    }
    //if there is no record, create one
    await db.insert(aitokenTable).values({
        "userId": userId,
        "numTokens": 50
    })
    return 50
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