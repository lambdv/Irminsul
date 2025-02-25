import { tool } from "ai";
import { z } from 'zod';
import { getCharacter, getWeapon, getArtifact } from "@/utils/genshinData";
import { toKey } from "@/utils/standardizers";
import { findRelevantContent } from "@/lib/ai/embedding";

export const getInformationTool = tool({
    description: `get information from your knowledge base to answer questions.`,
    parameters: z.object({
      question: z.string().describe('the users question'),
    }),
    execute: async ({ question }) => {
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
            let d = await getCharacter(flatId)
            // if (d === null)
            //     return {error: "character not found"};
            console.log(d)
            return d;
        } catch (error) {
            console.error('Error in get_character_data_tool:', error);
            return {error: "error occurred in get_character_data_tool"};
        }
    },
});

