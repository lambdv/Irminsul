import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, streamText, tool } from "ai";
import { z } from 'zod';
import { getCharacterDataTool, getInformationTool } from "./tools";
import { findRelevantContent } from '@/lib/ai/embedding';
import { eq, sql, and } from "drizzle-orm";
import db from "@/db/db";
import { aitokenTable } from "@/db/schema/aitoken";
import { purchasesTable } from "@/db/schema/purchase";
import { usersTable } from "@/db/schema/user";


// console.log(test)
const lmstudio = createOpenAICompatible({
    name: 'lmstudio',
    baseURL: 'http://localhost:1234/v1',
});

let modelName = ''
// modelName = 'deepseek-coder-33b-instruct-pythagora-v3'
modelName = 'llama-3.2-1b'
//modelName = 'deepseek-r1-distill-qwen-7b'

const model = lmstudio(modelName)

const systemPrompt =  
    "you are an ai assistant that helps genshin impact players with their questions about the game. including build guides, character guides, etc. you will answer questions related to genshin impact meta"
    + "make sure to check your knowledge base before answering any questions by using the getInformation tool and passing in the users question. the result of this tool is the most important information you need to answer the question"
    + "don't show the result of getInformation and getCharacterData tools to the user. nor should you tell the user that you're using the tools. just use the result to answer the question."

export async function generateResponse(prompt: string, userId: string){
    if(!(prompt.length > 0))
        return ""

    const tokensLeft = await getAiTokensLeft(userId)
    if(tokensLeft <= 0){
        return "You've run out of tokens. Please come back later!"
    }

    const { textStream } = streamText({
        model: model,
        system: systemPrompt,
        prompt: "you have to use the \"getInformation(question: string)\" tool (passing in the user's question to get info from your knowledge base) to awnser the following question: " + prompt,
        tools:{
            get_character_data: getCharacterDataTool,
            getCharacterData: getCharacterDataTool,
            get_information: getInformationTool,
            getInformation: getInformationTool,
        },
        maxSteps: 110,
    });

    const consumeToken = await consumeAiToken(userId)
    if(!consumeToken){
        return "You've run out of tokens. Please come back later!"
    }

    return textStream;
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

