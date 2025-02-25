import { embed, embedMany } from 'ai';
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { embeddings } from '@/db/schema/embeddings';
import db from '@/db/db';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';


import { createOpenAI } from '@ai-sdk/openai';

//for devlopment build
// const lmstudio = createOpenAICompatible({
//     name: 'lmstudio',
//     baseURL: 'http://localhost:1234/v1',
// });

// const embeddingModel = lmstudio.textEmbeddingModel("text-embedding-nomic-embed-text-v1.5-embedding")



const endpoint = process.env.AZURE_ENDPOINT || "https://models.inference.ai.azure.com";
const modelName = "text-embedding-3-small";



const openai = createOpenAI({
    apiKey: process.env.GITHUB_TOKEN,
    baseURL: endpoint,
})

const embeddingModel = openai.textEmbeddingModel(modelName)


const generateChunks = (input: string): string[] => {
    return input
      .trim()
      .split('.')
      .filter(i => i !== '');
};

export const generateEmbeddings = async (value: string): Promise<Array<{ embedding: number[]; content: string }>> => {
    const chunks = generateChunks(value);
    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: chunks,
    });
    return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};


export const generateEmbedding = async (value: string): Promise<number[]> => {
    const input = value.replaceAll('\\n', ' ');
    const { embedding } = await embed({
      model: embeddingModel,
      value: input,
    });
    return embedding;
  };
  
  export const findRelevantContent = async (userQuery: string) => {
    const userQueryEmbedded = await generateEmbedding(userQuery);

    const similarity = sql<number>`1 - (${cosineDistance(
      embeddings.embedding,
      userQueryEmbedded,
    )})`;
    
    const similarGuides = await db
      .select({ name: embeddings.content, similarity })
      .from(embeddings)
      .where(gt(similarity, 0.5))
      .orderBy(t => desc(t.similarity))
      .limit(20)
      
    return similarGuides;
  };