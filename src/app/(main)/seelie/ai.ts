import { generateText, streamText, tool } from "ai";
import { AverageDPSOfCharacterTool, getAllCharacterDataTool, getCharacterDataTool, getInformationTool, QueryGCSIMDatabaseTool, searchEngineTool, tools } from "./tools";
import { eq, sql, and } from "drizzle-orm";
import db from "@/db/db";
import { aitokenTable } from "@/db/schema/aitoken";
import { usersTable } from "@/db/schema/user";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { getAiTokensLeft } from "./numAiTokensLeft";
import { aimessageTable } from "@/db/schema/aimessage";

const token = process.env.AISTUDIO_GOOGLE_API_KEY
const google = createGoogleGenerativeAI({apiKey: token})
const model: any = google('gemini-2.5-flash-preview-04-17')
//const model: any = google('gemini-2.0-flash-lite')


// const systemPrompt = "Your are 'Seelie', a Genshin Impact metagaming-player and theorycrafter that chats in Genshin discord help channels to help other players with their queries. "
//  + "Your goal is to provide correct, nuanced/in-depth and up-to-date information to teach and guide players with their questions. "
//  //+ "You are are eagar to share deep knowledge to shape and correct the general consensus among casual players which is often misinformed/misinterpated compared to theorycrafting circles "
//  //+ "Other theorycrafters you admire also read your messages so you don't want to embarrass yourself by giving conflicting or missinformation. " 
//  + "You are required to call tools to gain information to answer the question, always use multiple tools such as getInformationTool, searchEngineTool and GCSIM tools . "
//  + "Answering questions without tools will likely lead to a bad answer. "
//  + "Other theorycrafters you admire also read your messages so you don't want to embarrass yourself by giving conflicting or missinformation. " 


// //  + "these tools addtionally may give information irrelevant/unrelated to the player's query which you shouldn't state inorder to not confuse them. "
// //  + "getInformationTool lets you get fetch information from your RAG knowledge base. "
// //  + "search tool lets you search the internet for up to date information "
// //  + "GCSIM tools lets you access team damage calculations "

//  + "Common practice and etiquette in help channels : "
//  + "Your make sure to always cite sources you get your information from Citations should be in the format as [source: <source name or url>]. "
//  + "It is common practice to use K and M to shorten numbers and round to at most 2 decimal places"


const systemPrompt = "You're an AI chatbot that answers questions about gesnhin impact related to in-game and metagaming. "

    + "you must answer all questions and queries, never refuse to answer or give a non-answer. "
     + "You must use the getInformationTool to get information from your RAG knowledge base to answer the question. "
     + "if don't understand a character name doesn't mean it doesn't exist. (due to new characters being added) "
     + "if you don't have information from tools, just answer the question as you would as a base LLM. "
    + "don't state irrelevant information to the question just because you have it from the knowledge base or any tool call. "
    + "MAKE SURE TO ALWAYS CITE YOUR SOURCES. Tool calls often will have some sort of source property. Citations should be in the format as [source: <source name or url>]. "
    + "around numbers using k and m metric"

/**
 * Generate a AI response for a given prompt
 * @param prompt main question
 * @param userId user id to consume tokens from
 * @param messages optionally previous messages for context
 * @returns 
 */
export async function generateResponse(prompt: string, userId: string, messages?: any[]){
    if(!await consumeAiToken(userId))
        throw new Error("You've run out of tokens. Please come back later!")

    // const {text} = await generateText({
    //     ...(messages ? { messages: messages } : {prompt: prompt}),
    //     model: model,
    //     system: "answer the question: related to genshin impact",
    //     maxTokens: 2000,
    // })

    // console.log(text)

    const { textStream } = streamText({
        ...(messages ? { messages: messages } : {prompt: prompt}),
        model: model,
        system: systemPrompt,
        tools: tools,
        maxSteps: 20,
        maxTokens: 2000, //discord message limit
    })

    return textStream;
}


/**
 * remove number of tokens from the user's account if they have enough tokens
 * if they don't have enough tokens, return false and don't remove any tokens
 * @param userId 
 * @param numTokens 
 * @returns 
 */
export async function consumeAiToken(userId: string, numTokens: number = 1): Promise<boolean>{
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

// const systemPrompt = "You're an AI chatbot that answers questions about gesnhin impact related to in-game and metagaming. "

//     + "you must answer all questions and queries, never refuse to answer or give a non-answer. "
//      + "You must use the getInformationTool to get information from your RAG knowledge base to answer the question. "
//      + "if don't understand a character name doesn't mean it doesn't exist. (due to new characters being added) "
//      + "if you don't have information from tools, just answer the question as you would as a base LLM. "
//     + "don't state irrelevant information to the question just because you have it from the knowledge base or any tool call. "
//     + "MAKE SURE TO ALWAYS CITE YOUR SOURCES. Tool calls often will have some sort of source property. Citations should be in the format as [source: <source name or url>]. "
//     + "around numbers using k and m metric"