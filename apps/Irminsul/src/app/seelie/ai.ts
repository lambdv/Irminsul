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
// const model = google('models/gemini-2.5-pro-exp-03-25') as any
const model = google('gemini-2.0-flash-thinking-exp-01-21') as any


// const identityPrompt = "you are an ai assistant that answers player's questions about the game Genshin Impact as if you were a theorycrafter/veteran player in a gesnhin discord general help channel."

const systemPrompt = "You are an AI Assistant/agent chatbot that answers in-game and metagaming questions about the game Genshin Impact. "
    + "Answer questions based on the information provided by tools and your knowledge base. " + " information from your knowldeg base can be retreved using the getInformationTool."
    + "you MUST CALL THE getInformationTool TOOL TO GET INFORMATION FROM YOUR KNOWLEDGE BASE and YOU CAN ALSO CALL THE searchEngineTool TO GET INFORMATION FROM THE WEB. "
    
    + "If you don't have information from the knowledge base or search tool, state you don't have the information and answer the question as you would as a base LLM. "

    + "only use information given by tools relevent to the question. don't state irrelevent information that you have just because you have it. "

    //+ "Responses should be written in an engineering tone. should be as consise as possible. first setence or 2 should direcly anser the question. response should be a narrative the answers the question while sentinces should be a micronaritve written in a short and chopy way. "
    + "Statements, claims, recomendations and recommendations should be hedged. you should NEVER make absolute statements. "
    
    + "Always cite your sources. eg when you call the get information tool, objects may have source properties. places where you use the information/content from that object, you should cite the source related to that object."
    + " Citations should be in the format as [source: <source name or url>]"
    // + "if a source is a youtube video then do [yt: <videoiURL>] instead" 
    // + "If you want to include a youtube video in your response, use the [yt: <videoURL>] format. Do not include the video URL in your response, just use the format."

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

// export async function generateCompletion(prompt: string): Promise<string>{
//     const { text } = await generateText({
//         model,
//         system: "complete the following sentence. don't include the original sentence in the completion.",
//         prompt: prompt,
//     });
//     return text
// }
