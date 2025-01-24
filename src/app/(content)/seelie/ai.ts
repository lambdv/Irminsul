import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

// console.log(test)
const lmstudio = createOpenAICompatible({
    name: 'lmstudio',
    baseURL: 'http://localhost:1234/v1',
});

const model = lmstudio('deepseek-coder-33b-instruct-pythagora-v3')

const systemPrompt =  
    `you are a ai chatbot agent that helps users/players of genshin impact with their questions. this can include meta info such as build guides, character guides, etc. you WILL answer questions related to genshin impact meta` +
    `make sure your answers are accurate are not wordy. Max number of words should be 250 but less is better.` +
    `do not hallucinate.`

export async function generateResponse(prompt: string): Promise<string> {
    if(!(prompt.length > 0))
        return ""

    const { text } = await generateText({
        model: model,
        prompt: prompt,
        system: systemPrompt,
        maxTokens: 250,
        temperature: 0.7,
    });
    return text;
}