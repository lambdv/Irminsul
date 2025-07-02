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

export const QueryGCSIMDatabaseTool = tool({
    description: `query Gcsim Team Calculation Database. this is a powerful tool you can be used to answer questions related to teams and damage and what the "best" x or what is "good". 
        make sure to cite the source in the object attribute "source" which is a link to the simulator`,
    parameters: z.object({
        characters: z.array(z.string()).optional().describe('array of character names to include in team. to just find a all teams for a character, just put the character name in the array'),
        excludeCharacters: z.array(z.string()).optional().describe('array of character names to exclude from team'),
        limit: z.number().optional().describe('number of results to return (default: 25)'),
        skip: z.number().optional().describe('number of results to skip (default: 0)'),
        acceptedTags: z.array(z.number()).optional().describe('array of accepted tag IDs to include'),
        rejectedTags: z.array(z.number()).optional().describe('array of rejected tag IDs to exclude'),
        sortBy: z.string().optional().describe('sort field (default: "summary.mean_dps_per_target")'),
        sortOrder: z.enum(['asc', 'desc']).optional().describe('sort order (default: "desc" for DPS)'),
    }),
    execute: async ({ characters, excludeCharacters, limit = 10, skip = 0, acceptedTags, rejectedTags, sortBy = "summary.mean_dps_per_target", sortOrder = "desc" }) => {
        try {
            const results = await queryGCSIMDatabase({
                characters,
                excludeCharacters,
                limit,
                skip,
                acceptedTags,
                rejectedTags,
                sortBy,
                sortOrder
            });
            return results;
        } catch (error) {
            console.error('Error in DPSTool:', error);
            return { error: "Failed to query GC SIM database" };
        }
    },
});

export const AverageDPSOfCharacterTool = tool({
    description: `get the average dps of a character`,
    parameters: z.object({
        character: z.string().describe('name of character'),
    }),
    execute: async ({ character }) => {
        const allTeams = await queryGCSIMDatabase({
            characters: [character],
            limit: 25,
            sortBy: "summary.mean_dps_per_target",
            sortOrder: "desc"
        })
        const averageDPS = allTeams.reduce((acc, team) => acc + team.dps, 0) / allTeams.length
        return averageDPS
    },
});

/**
 * Query the GC SIM database for team calculations
 */
export const queryGCSIMDatabase = async (params: {
    characters?: string[];
    excludeCharacters?: string[];
    limit?: number;
    skip?: number;
    acceptedTags?: number[];
    rejectedTags?: number[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}) => {
    const {
        characters,
        excludeCharacters,
        limit = 10,
        skip = 0,
        acceptedTags,
        rejectedTags,
        sortBy = "summary.mean_dps_per_target",
        sortOrder = "desc"
    } = params;

    // Build the query object
    const query: any = {
        limit,
        skip,
        sort: {
            [sortBy]: sortOrder === 'desc' ? -1 : 1
        }
    };

    // Build the $and array for complex queries
    const andConditions: any[] = [];

    // Add character inclusion filters
    if (characters && characters.length > 0) {
        characters.forEach(char => {
            andConditions.push({
                "summary.char_names": char.toLowerCase()
            });
        });
    }

    // Add character exclusion filters
    if (excludeCharacters && excludeCharacters.length > 0) {
        excludeCharacters.forEach(char => {
            andConditions.push({
                "summary.char_names": {
                    $ne: char.toLowerCase()
                }
            });
        });
    }

    // Add accepted tags filter (include teams with these tags)
    if (acceptedTags && acceptedTags.length > 0) {
        andConditions.push({
            accepted_tags: {
                $in: acceptedTags
            }
        });
    }

    // Add rejected tags filter (exclude teams with these tags)
    if (rejectedTags && rejectedTags.length > 0) {
        andConditions.push({
            accepted_tags: {
                $nin: rejectedTags
            }
        });
    }

    // Only add query if we have conditions
    if (andConditions.length > 0) {
        query.query = {
            $and: andConditions
        };
    }

    // Encode the query as URL parameter
    const encodedQuery = encodeURIComponent(JSON.stringify(query));
    const url = `https://simpact.app/api/db?q=${encodedQuery}`;


    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Add source URL to each result
        if (data.data && Array.isArray(data.data)) {
            data.data = data.data.map((item: any) => ({
                source: `https://gcsim.app/db/${item._id}`,
                description: item.description,
                team_members: item.summary.char_names,
                dps: item.summary.mean_dps_per_target,
                assumptions: item.summary.team,
            }));
        }
        
        console.log(data.data)

        return data.data
        
    } catch (error) {
        console.error('Error querying GC SIM database:', error);
        throw error;
    }
};

export const tools = {
    getInformationTool: getInformationTool,
    getCharacterDataTool: getCharacterDataTool,
    getAllCharacterDataTool: getAllCharacterDataTool,
    searchEngineTool: searchEngineTool,
    QueryGCSIMDatabaseTool: QueryGCSIMDatabaseTool,
    AverageDPSOfCharacterTool: AverageDPSOfCharacterTool,
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

        return textContent
    } catch (error) {
        console.error(`Error fetching content from ${url}:`, error);
        return ''; // Return empty string if fetch fails
    }
}