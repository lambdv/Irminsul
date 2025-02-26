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

// export const getNounCategoryTool = tool({
//     description: 'tool that takes a noun (something in the genshin impact universe, stored as a table in the database) and returns the category of the noun',
//     parameters: z.object({
//         noun: z.string().describe('noun'),
//     }),
//     execute: async ({ noun }) => {
       
//         const nounId = toKey(noun)
//         await 
//     }
    
// })
