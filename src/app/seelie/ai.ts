import { generateText, streamText, tool } from "ai";
import { tools } from "./tools";
import { eq, sql, and } from "drizzle-orm";
import db from "@/db/db";
import { aitokenTable } from "@/db/schema/aitoken";
import { usersTable } from "@/db/schema/user";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { getAiTokensLeft } from "./numAiTokensLeft";

const token = process.env.AISTUDIO_GOOGLE_API_KEY
const google = createGoogleGenerativeAI({
    apiKey: token
})

const model = google('gemini-2.0-flash') as any

const systemPrompt =  
    "You are an AI Assistant/agent chatbot that answers in-game and metagaming questions about the game Genshin Impact."
    + "You will answer questions based on the information provided in the knowledge base. To gain information about the game, use the getInformation tool "
        // + " If you don't have the information, just say so. Don't make up information or make assumptions."
    + "If you don't have information from the knowledge base,  Just generate information based on the base llm, but tell the user that you don't have information from the knowledge base and you are using the base llm to answer the question."

    + "ALWAYS CITE YOUR SOURCES TO AVOID PLAGERISM. Use ieee formate if you can. Sources are provided with each resource object from the knowledge base."
    + "make sure to link sources and other hyperlinks as a tags"

    + "getCharacterDataTool can be used to get json data about character from in game data."

    + "Responses should be as consise as possible, don't use any fluff or extra words. Just answer the question directly in 1-2 sentences for simple questions and 1-2 paragraphs for complex questions."

    //+ "Information being presented should be written in an engineering tone where the message's narative is to answer the question and each sentence is a micro-narrative. Sentences should be short and chopy." 
    + "When using information from the knowledge base, don't just use directly tell the information or use all the information. Only use the information that is relevant to the question and don't use the information that is not relevant to the question."
    + "You can and should use information from the base LLM to also answer the question along side the knowledge base information."
    + "When recommending options, don't just state all options, only use the information to recommend options relevant to the question and use break point ranges for Best and some other viable options for lets say free to play investment."
    + "When making claims, recomendations or statements, write it using hedging techniques and words rather than absolute statements. For example, instead of \"She is the best electro dedicated carry\" write \"She is considered one of the best electro dedicated carries\". This should be done even if the information is from the knowledge base."

export async function generateResponse(prompt: string, userId: string, messages?: any[]){
    const { textStream } = streamText({
        model,
        system: systemPrompt,
        tools: tools,
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
// const lmstudio = createOpenAICompatible({
//     name: 'lmstudio',
//     baseURL: 'http://localhost:1234/v1',
// });
// const devModel = lmstudio('deepseek-coder-33b-instruct-pythagora-v3')