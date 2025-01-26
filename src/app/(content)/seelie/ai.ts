import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, streamText, tool } from "ai";
import { z } from 'zod';
import { getCharacters, getWeapons, getArtifacts, getCharacter, getWeapon, getArtifact } from "@/utils/genshinData";

/**
 * ai sdk tool adaptor for the genshinData functions
 */
const get_character_data = tool({
    description: 'get in-game data and values from genshin impact for characters, weapons, and artifacts from the database',
    parameters: z.object({
      category: z.enum(['character', 'weapon', 'artifact']).describe('Category of record data to get (character, weapon, artifact)'),
      id: z.string().describe('specifiy the identifier of the record to get'),
    }),
    execute: async ({ category, id }) => {
        try {
            switch(category) {
                case 'character':
                    return await getCharacter(id);
                case 'weapon':
                    return await getWeapon(id);
                case 'artifact':
                    return await getArtifact(id);
                default:
                    return {error: "invalid category"};
            }
        } catch (error) {
            console.error('Error in geshinDataTool:', error);
            return {error: "invalid category"};
        }
    },
});

const get_character_data_tool = tool({
    description: 'get in-game data and values from genshin impact for characters, weapons, and artifacts from the database',
    parameters: z.object({
      category: z.enum(['character', 'weapon', 'artifact']).describe('Category of record data to get (character, weapon, artifact)'),
      id: z.string().describe('specifiy the identifier of the record to get'),
    }),
    execute: async ({ category, id }) => {
        try {
            return await getCharacter(id);
        } catch (error) {
            console.error('Error in get_character_data_tool:', error);
            return {error: "invalid category"};
        }
    },
})



// console.log(test)
const lmstudio = createOpenAICompatible({
    name: 'lmstudio',
    baseURL: 'http://localhost:1234/v1',
});

const model = lmstudio('llama-3.2-1b')
// const model = lmstudio('deepseek-coder-33b-instruct-pythagora-v3')

const systemPrompt =  
    `you are a ai chatbot agent that helps users/players of genshin impact with their questions. this can include meta info such as build guides, character guides, etc. you WILL answer questions related to genshin impact meta` +
    `make sure your answers are accurate are not wordy. aim for 100 words or less.` +
    `do not hallucinate.`

export async function generateResponse(prompt: string){
    if(!(prompt.length > 0))
        return ""

    // const { text } = await generateText({
    //     model: model,
    //     prompt: prompt,
    //     system: systemPrompt,
    //     maxTokens: 200,
    //     temperature: 0.7,
    // });

    const { textStream } = streamText({
        model: model,
        prompt: prompt,
        system: systemPrompt,
        maxTokens: 100,
        temperature: 0.7,
        // tools:{
        //     getCharacterData: get_character_data_tool
        // },
        // maxSteps: 1,
    });



    return textStream;
}