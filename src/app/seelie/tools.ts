import { generateText, tool } from "ai";
import { z } from 'zod';
import { getCharacter, getWeapon, getArtifact, getCharacters } from "@/utils/genshinData";
import { toKey } from "@/utils/standardizers";
import { findRelevantContent } from "@/lib/ai/embedding";
import { aitokenTable } from "@root/src/db/schema/aitoken";
import { eq, sql } from "drizzle-orm";
import db from "@root/src/db/db";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamUI } from "ai/rsc"

const token = process.env.AISTUDIO_GOOGLE_API_KEY
const google = createGoogleGenerativeAI({apiKey: token})
const model = google('models/gemini-2.0-flash-exp') as any
const dumbModel = google('models/gemini-1.5-flash') as any

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
            .then(items => items.map(item => {
                return {
                    title: item.title,
                    snippet: item.snippet,
                    source: item.link,
                }
            }))
            .catch(e => {
                console.error('Search engine error:', e);
                return [];
            });

        const processedResults = [];
        for (const item of res) {
            try {
                let content = await fetchWebpageContent(item.source, query);
                // let summary = await summarizeContent(content)
                processedResults.push({
                    ...item,
                    content,
                });
            } catch (error) {
                console.error(`Error processing content for ${item.source}:`, error);
                processedResults.push(item); // Keep the item without content
            }
        }

        console.log("searchEngineTool called");
        console.log(processedResults);
        return processedResults
    },
});



export const tools = {
    getInformationTool: getInformationTool,
    getCharacterDataTool: getCharacterDataTool,
    getAllCharacterDataTool: getAllCharacterDataTool,
    searchEngineTool: searchEngineTool,
}


/**
 *         const res = await fetch(`https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=${numResults}`)
            .then(res => res.json())
            .then(data => data.items || [])
            .then(items => items.map(item => {
                 
                return {
                    title: item.title,
                    snippet: item.snippet,
                    source: item.link
                }
            }))
            .catch(e => {
                console.error('Search engine error:', e);
                return [];
            });

        console.log("searchEngineTool called")
        console.log(res)
        return res
 */

async function summarizeContent(content: string) {
    const { text: summary } = await generateText({
        model: dumbModel,
        prompt: content,
        system: "summarize the content of the following text. only return the summary, no other text.",
        maxSteps: 1,
    });
    return summary;
}

/**
 * Helper function to fetch and extract content from a webpage
 */
async function fetchWebpageContent(url: string, searchQuery: string): Promise<string> {
    try {
        const response = await fetch(url);
        const html = await response.text();
        
        // Basic HTML to text conversion
        // Remove scripts, styles, and other non-content elements
        const textContent = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // Find the position of the search query in the text (case insensitive)
        const queryPosition = textContent.toLowerCase().indexOf(searchQuery.toLowerCase());
        
        if (queryPosition === -1) {
            // If query not found, return first 1000 characters
            return textContent.slice(0, 1000);
        }

        // Extract a window of text around the query (500 chars before and after)
        const start = Math.max(0, queryPosition - 500);
        const end = Math.min(textContent.length, queryPosition + searchQuery.length + 500);
        
        return textContent.slice(start, end);
    } catch (error) {
        console.error(`Error fetching content from ${url}:`, error);
        return ''; // Return empty string if fetch fails
    }
}