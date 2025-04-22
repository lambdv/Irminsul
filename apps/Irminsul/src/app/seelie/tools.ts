import { generateText, tool } from "ai";
import { z } from 'zod';
import { getCharacter, getWeapon, getArtifact, getCharacters } from "@/utils/genshinData";
import { toKey } from "@/utils/standardizers";
import { findRelevantContent } from "@/lib/ai/embedding";
import { aitokenTable } from "@root/src/db/schema/aitoken";
import { eq, sql } from "drizzle-orm";
import db from "@root/src/db/db";
import { google } from "@ai-sdk/google";
import { streamUI } from "ai/rsc"

/**
 * AISDK tool for getting information from the knowledge base
 */
export const getInformationTool = tool({
    description: `get information from your knowledge base to answer questions.`,
    parameters: z.object({
      question: z.string().describe('the users question'),
    }),
    execute: async ({ question }) => {
        console.log("getInformationTool called")
        const similarResources = await findRelevantContent(question)
        console.log(similarResources)
        return similarResources        
    },

});


const model = google('models/gemini-2.0-flash-exp') as any

/**
 * AISDK tool for asking ai to answer the question
*/
export const askLLMTool = tool({
    description: `ask an llm to answer the question`,
    parameters: z.object({
        question: z.string().describe('the users question'),
    }),
    execute: async ({ question }) => {
        const { text: llmAwnser } = await generateText({
            model,
            system: "can you answer this question related to the game Genshin Impact?",
            prompt: question,
            maxSteps: 1,
        });
        console.log(llmAwnser)
        return llmAwnser
    }
})

/**
 * AISDK tool for getting character data from the database
 */
export const getCharacterDataTool = tool({
    description: 'get character data from the database',
    parameters: z.object({
        characterName: z.string().describe('name of character'),
    }),
    execute: async ({ characterName }) => {
        try {
            const flatId = toKey(characterName)
            let data = await getCharacter(flatId)
            if (!data)
                return {error: "character not found"};
            return data;
        } catch (error) {
            console.error('Error in get_character_data_tool:', error);
            return {error: "error occurred in get_character_data_tool"};
        }
    },
});

/**
 * AISDK tool for getting all character data from the database
 */
export const getAllCharacterDataTool = tool({
    description: 'get all character data from the database',
    parameters: z.object({
    }),
    execute: async () => {
        try {
            let data = await getCharacters()
            if (!data)
                return {error: "character not found"};
            return data;
        } catch (error) {
            console.error('Error in get_character_data_tool:', error);
            return {error: "error occurred in get_character_data_tool"};
        }
    },
});

/**
 * AISDK tool for refunding tokens to the user
 */
export const refundTokenTool = tool({
    description: 'refund tokens to the user. this should only be called when there are no relevent resources from the knowledge base to answer the question.',
    parameters: z.object({
        userId: z.string().describe('user id'),
        numTokens: z.number().describe('number of tokens to refund'),
    }),
    execute: async ({ userId, numTokens }) => {
        await db.update(aitokenTable)
            .set({ numTokens: sql`${aitokenTable.numTokens} + ${numTokens}` })
            .where(eq(aitokenTable.userId, userId))
        return true
    },
});

/**
 * AISDK tool for getting information from a search engine
 */
export const searchEngineTool = tool({
    description: `search the web for real-time information about Genshin Impact`,
    parameters: z.object({
      query: z.string().describe('search query'),
      numResults: z.number().optional().describe('number of results to return (default: 3)'),
    }),
    execute: async ({ query, numResults = 3 }) => {
        const res = await fetch(`https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=${numResults}`)
            .then(res => res.json())
            .then(data => data.items || [])
            .then(items => items.map(item =>    {
                console.log(item)
                return {
                title: item.title,
                link: item.link,
                snippet: item.snippet,

                source: 'web'
            }
        }))
            .catch(e => {
                console.error('Search engine error:', e);
                return [];
            });

        console.log("searchEngineTool called")
        console.log(res)
        return res
    },
});

export const tools = {
    getInformationTool: getInformationTool,
    getCharacterDataTool: getCharacterDataTool,
    getAllCharacterDataTool: getAllCharacterDataTool,
    refundTokenTool: refundTokenTool,
    searchEngineTool: searchEngineTool,
    //askLLMTool: askLLMTool
}