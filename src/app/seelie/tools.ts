import { tool } from "ai";
import { z } from 'zod';
import { getCharacter, getWeapon, getArtifact } from "@/utils/genshinData";
import { toKey } from "@/utils/standardizers";
import { findRelevantContent } from "@/lib/ai/embedding";

// /**
//  * ai sdk tool adaptor for the genshinData functions
//  */
// export const get_character_data = tool({
//     description: 'get in-game data and values from genshin impact for characters, weapons, and artifacts from the database',
//     parameters: z.object({
//       category: z.enum(['character', 'weapon', 'artifact']).describe('Category of record data to get (character, weapon, artifact)'),
//       id: z.string().describe('specifiy the identifier of the record to get'),
//     }),
//     execute: async ({ category, id }) => {
//         try {
//             switch(category) {
//                 case 'character':
//                     return await getCharacter(id);
//                 case 'weapon':
//                     return await getWeapon(id);
//                 case 'artifact':
//                     return await getArtifact(id);
//                 default:
//                     return {error: "invalid category"};
//             }
//         } catch (error) {
//             console.error('Error in geshinDataTool:', error);
//             return {error: "invalid category"};
//         }
//     },
// });

// export const get_character_data_tool = tool({
//     description: 'get in-game data and values from genshin impact for characters, weapons, and artifacts from the database',
//     parameters: z.object({
//       category: z.enum(['character', 'weapon', 'artifact']).describe('Category of record data to get (character, weapon, artifact)'),
//       id: z.string().describe('specifiy the identifier of the record to get'),
//     }),
//     execute: async ({ category, id }) => {
//         try {
//             return await getCharacter(id);
//         } catch (error) {
//             console.error('Error in get_character_data_tool:', error);
//             return {error: "invalid category"};
//         }
//     },
// })


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

export const getInformationTool = tool({
    description: `get information from your knowledge base to answer questions.`,
    parameters: z.object({
      question: z.string().describe('the users question'),
    }),
    execute: async ({ question }) => {
        const res = await findRelevantContent(question)
        console.log(res)
        return res
    },
});