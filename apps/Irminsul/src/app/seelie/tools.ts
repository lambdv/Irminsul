import { tool } from "ai";
import { z } from 'zod';
import { getCharacter, getWeapon, getArtifact, getCharacters } from "@/utils/genshinData";
import { toKey } from "@/utils/standardizers";
import { findRelevantContent } from "@/lib/ai/embedding";
import { aitokenTable } from "@root/src/db/schema/aitoken";
import { eq, sql } from "drizzle-orm";
import db from "@root/src/db/db";

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


export const tools = {
    getInformationTool,
    getCharacterDataTool,
    getAllCharacterDataTool,
    refundTokenTool
}