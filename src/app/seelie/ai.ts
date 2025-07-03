import { generateText, streamText, tool } from "ai";
import { tools } from "./tools";
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
const model: any = google('gemini-2.0-flash-lite')

// const identityPrompt = "you are an ai assistant that answers player's questions about the game Genshin Impact as if you were a theorycrafter/veteran player in a gesnhin discord general help channel."
const systemPrompt = "You're an AI chatbot that answers questions about gesnhin impact related to in-game and metagaming. "
    //+ "you should call the tools avaible to you to produce better results.  "
    + "you must answer all questions and queries, never refuse to answer or give a non-answer. "
     + "You must use the getInformationTool to get information from your RAG knowledge base to answer the question. "
     + "just because you don't understand a character name doesn't mean it doesn't exist. (due to new characters being added)"
     //+ "Remember that information changes over time. just because you don't understand certain nouns (eg: character name) doesn't teman they don't exist. so stop saying that something doesn't exist just because you don't understand it. " 
     + "if you don't have information from tools, just answer the question as you would as a base LLM. "
    //+ "If you don't have information from the knowledge base or search tool, state you don't have the information and answer the question as you would as a base LLM. "
    //+ "don't state irrelevant information to the question just because you have it from the knowledge base or any tool call. "
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
        maxTokens: 2000,
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