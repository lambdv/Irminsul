import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, streamText, tool } from "ai";
import { z } from 'zod';
import { getCharacterDataTool, getInformationTool } from "./tools";
import { findRelevantContent } from '@/lib/ai/embedding';



// console.log(test)
const lmstudio = createOpenAICompatible({
    name: 'lmstudio',
    baseURL: 'http://localhost:1234/v1',
});

// const modelName = 'deepseek-coder-33b-instruct-pythagora-v3'
const modelName = 'llama-3.2-1b'
// const modelName = 'deepseek-r1-distill-qwen-7b'

const model = lmstudio(modelName)


const systemPrompt =  
    "you are an ai assistant that helps genshin impact players with their questions about the game. including build guides, character guides, etc. you will answer questions related to genshin impact meta"
    + "make sure to check your knowledge base before answering any questions by using the getInformation tool and passing in the users question. the result of this tool is the most important information you need to answer the question"
    // `you are a ai chatbot agent that helps users/players of genshin impact with their questions. Check your knowledge base before answering any questions. this can include meta info such as build guides, character guides, etc. you WILL answer questions related to genshin impact meta` +
    // `do not hallucinate.`
    // `if the user askes about information about a character, use the get_character_data(characterName) tool and pass in the characters name. this tool will return json data that you will use the answer the question`

    // + "when you mention a character, weapon or artifact: provide a link to the resource in our website: <a href='/archive/insertCategoryHere/insertNameHere'>insertNameHere</a>"
    + "don't show the result of getInformation and getCharacterData tools to the user. nor should you tell the user that you're using the tools. just use the result to answer the question."

export async function generateResponse(prompt: string){
    if(!(prompt.length > 0))
        return ""

    const { textStream, steps } = streamText({
        model: model,
        system: systemPrompt,
        prompt: "you have to use the \"getInformation(question: string)\" tool (passing in the user's question to get info from your knowledge base) to awnser the following question: " + prompt,
        tools:{
            get_character_data: getCharacterDataTool,
            getCharacterData: getCharacterDataTool,
            get_information: getInformationTool,
            getInformation: getInformationTool,
        },
        maxSteps: 110,
    });


    return textStream;
}