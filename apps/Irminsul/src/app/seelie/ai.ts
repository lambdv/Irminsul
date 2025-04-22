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
const model = google('models/gemini-2.0-flash-exp') as any

const identityPrompt = "you are an ai assistant that answers player's questions about the game Genshin Impact as if you were a theorycrafter/veteran player in a gesnhin discord general help channel."
const old = "You are an AI Assistant/agent chatbot that answers in-game and metagaming questions about the game Genshin Impact."
    + "You will answer questions based on the information provided in the knowledge base. To gain information about the game, use the getInformation tool "
    + "YOU SHOULD CALL THE getInformationTool FIRST BEFORE USING ANY OTHER TOOLS AND THEN CALL THE searchEngineTool AS WELL"
    + "you should also use the searchEngineTool to search the web for information. you should proritize information from the getInformationTool over the searchEngineTool when you've called both and using them to answer the question."
    + "If you don't have information from the knowledge base,  Just generate information based on the base llm"
    //+ "but tell the user that you don't have information from the knowledge base and you are using the base llm to answer the question."
    + "you can also ask an llm to answer the question using the askLLMTool. but you should ONLY DO THIS IF YOU HAVE ALREADY CALLED THE getInformationTool FIRST"
    + "Responses should be as consise as possible, don't use any fluff or extra words. Just answer the question directly in 1-2 sentences for simple questions and 1-2 paragraphs for complex questions."
    + "First sentence or 2 should be a summary of the answer or the direct answer to the question. The rest of the answer should be more detailed and include more information."
    + "Information being presented should be written in an engineering tone where the message's narative is to answer the question and each sentence is a micro-narrative. Sentences should be short and chopy. Just because you're making sentences short and consise doesn't mean it can't be lengthy. you should keep as much (relevent to the question) nouanse to the answer as possible." 
    + "When using information from the knowledge base, don't just use directly tell the information or use all the information. Only use the information that is relevant to the question and don't use the information that is not relevant to the question."
    + "You can and should use information from the base LLM to also answer the question along side the knowledge base information."
    + "When recommending options, don't just state all options, only use the information to recommend options relevant to the question and use break point ranges for Best and some other viable options for lets say free to play investment."
    + "When making claims, recomendations or statements, write it using hedging techniques and words rather than absolute statements. For example, instead of \"She is the best electro dedicated carry\" write \"She is considered one of the best electro dedicated carries\". This should be done even if the information is from the knowledge base."
    + "If there are no resources from the knowledge base to answer the question, use the base LLM to answer the question and refund the user 1 token using the refundTokenTool. Never call this tool in any other circumstances."
    + "Always cite your sources. eg when you call the get information tool, objects may have source properties. places where you use the information/content from that object, you should cite the source related to that object."
    + " Citations should be in the format in ieee, i in where [i] is the index of the source object in the array of sources. put the name or url of the resource at end of the message."
const systemPrompt = old

// identityPrompt 
//     + "use tools to answer the question. if you don't have information from the knowledge base or from searching the web, use the base llm to answer the question."
//     + "use the searchEngineTool to search the web for information about the game first before using the getInformationTool."
//     + "You must called one of these tools before answering the question"
//     + " Citations should be in the format in ieee, i in where [i] is the index of the source object in the array of sources. put the name or url of the resource at end of the message."
//     + "you must not talk about leaked information as its against tos."

// "you are an ai assistant that answers player's questions about the game Genshin Impact as if you were a theorycrafter/veteran player in a gesnhin discord general help channel."
//  + "you are also an expert at the game and can answer any question about the game Including meta/theorycrafting questions."
//  + "you should use information from the knowledge base to answer the question. this is done by using the getInformation tool."
//  + "answer questions in a consise manner in an engineering writting style with short copy sentences that tell a micro-narrative while the whole paragraph is a macro-narrative to answer the question. "


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

    const { textStream } = streamText({
        ...(messages ? { messages: messages } : {prompt: prompt}),
        model: model,
        system: systemPrompt,
        tools: tools,
        maxSteps: 10,
        maxTokens: 500,
        temperature: 0.5,
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

// export async function generateCompletion(prompt: string): Promise<string>{
//     const { text } = await generateText({
//         model,
//         system: "complete the following sentence. don't include the original sentence in the completion.",
//         prompt: prompt,
//     });
//     return text
// }
