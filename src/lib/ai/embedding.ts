import { embed, embedMany } from 'ai';
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { embeddings } from '@/db/schema/embeddings';
import db from '@/db/db';
import { cosineDistance, desc, gt, eq, sql } from 'drizzle-orm';
import { resources } from '@/db/schema/resources';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

//for devlopment build
// const lmstudio = createOpenAICompatible({
//     name: 'lmstudio',
//     baseURL: 'http://localhost:1234/v1',
// });

// const embeddingModel = lmstudio.textEmbeddingModel("text-embedding-nomic-embed-text-v1.5-embedding")



// const endpoint = process.env.AZURE_ENDPOINT || "https://models.inference.ai.azure.com";
// const modelName = "text-embedding-3-small";



// const openai = createOpenAI({
//     apiKey: process.env.GITHUB_TOKEN,
//     baseURL: endpoint,
// })

// const embeddingModel = openai.textEmbeddingModel(modelName)

const token = process.env.AISTUDIO_GOOGLE_API_KEY
const google = createGoogleGenerativeAI({
    apiKey: token
  })

const embeddingModel = google.textEmbeddingModel('text-embedding-004', {
    outputDimensionality: 512, 
  });


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

    const similarEmbeddings = await db
      .select({
        name: embeddings.content,
        similarity,
        resourceId: embeddings.resourceId
      })
      .from(embeddings)
      .where(gt(similarity, 0.5))
      .orderBy(desc(similarity))
      .limit(20)
      .execute();


    const uniqueEmbeddingsMap = new Map<string, { resourceId: string; similarity: number }>();


    for (const embedding of similarEmbeddings) {
        const existing = uniqueEmbeddingsMap.get(embedding.resourceId);
        if (!existing || existing.similarity < embedding.similarity) {
            uniqueEmbeddingsMap.set(embedding.resourceId, { resourceId: embedding.resourceId, similarity: embedding.similarity });
        }
    }

    const uniqueEmbeddings = Array.from(uniqueEmbeddingsMap.values());
      

    const similarResources = await Promise.all(uniqueEmbeddings.map(async (e) => {
      const resource = await db
        .select()
        .from(resources)
        .where(eq(resources.id, e.resourceId));
      return resource[0] || null;
    }))
    .then(results => results.filter(resource => resource !== null));


    return similarResources; // Return similarResources instead of similarEmbeddings
  };

  // type ReleventContent = {
  //   name: string
  //   similarity: number
  //   resourceId: string
  //   content: string
  // }