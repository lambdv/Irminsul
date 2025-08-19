import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { getCharacters } from "@/utils/genshinData";
import { toKey } from "@/utils/standardizers";

/**
 * function that takes the prompt and extracts features/metadata
 */
export const queryFeatureExtractor = async (prompt: string) => {

    let features = {
        characterMentioned: [],
    }

    //get all character name/nounes in the prompt
    const characterNouns = await getCharacters()
        .then(c=>c.map(c=>toKey(c.name)))
    
    prompt.split(" ").forEach(word => {
        if(characterNouns.includes(toKey(word))) {
            features.characterMentioned.push(word)
        }
    })



    const { text } = await generateText({
        model: google('gemini-2.5-flash-preview-04-17'),
        prompt: "this is a user prompt asking a question about genshin impact"
            + "extract the features/metadata from the prompt as a json object"
            + "the prompt is: \"" + prompt + "\"",
        maxTokens: 1000,
        temperature: 0.0,
    });

    const features_from_model = JSON.parse(text)
    features = {
        ...features,
        ...features_from_model
    }
    return features

}

queryFeatureExtractor("what is the best team for klee?")
    .then(console.log)
    .catch(console.error)