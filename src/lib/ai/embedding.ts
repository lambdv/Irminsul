
import { embed, embedMany } from 'ai';
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import db from '@/db/db';
import vector from '@/db/vector';
import { cosineDistance, desc, gt, eq, sql } from 'drizzle-orm';
// import { embeddings } from '@/db/schema/_embeddings';
// import { resources } from '@/db/schema/_resources';

import { embeddings } from '@/db/schema';
import { embeddings as embeddings2 } from '@/db/schema/_embeddings';
import { resources as resources2 } from '@/db/schema/_resources';

import { resources } from '@/db/schema';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

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
  
export const findRelevantContentOld = async (userQuery: string) => {
    const userQueryEmbedded = await generateEmbedding(userQuery);

    console.log("userQueryEmbedded", userQueryEmbedded)

    const similarity = sql<number>`1 - (${cosineDistance(
      embeddings.embedding,
      userQueryEmbedded,
    )})`;

    console.log("embeddings.embedding", embeddings.embedding)


    console.log(embeddings2.embedding)
    const similarEmbeddings = await db
      .select({
        name: embeddings2.content,
        similarity
      })
      .from(embeddings2)
      .where(gt(similarity, 0.5))
      .orderBy(desc(similarity))
      .limit(20)
      .execute();


    console.log("similarEmbeddings", similarEmbeddings)
    


    // const uniqueEmbeddingsMap = new Map<string, { resourceId: string; similarity: number }>();
    // for (const embedding of similarEmbeddings) {
    //     const existing = uniqueEmbeddingsMap.get(embedding.resourceId);
    //     if (!existing || existing.similarity < embedding.similarity) {
    //         uniqueEmbeddingsMap.set(embedding.resourceId, { resourceId: embedding.resourceId, similarity: embedding.similarity });
    //     }
    // }
    // const uniqueEmbeddings = Array.from(uniqueEmbeddingsMap.values());
    // const similarResources = await Promise.all(uniqueEmbeddings.map(async (e) => {
    //   const resource = await vector
    //     .select()
    //     .from(resources)
    //     .where(eq(resources.id, e.resourceId));
    //   return resource[0] || null;
    // }))
    // .then(results => results.filter(resource => resource !== null));


    return similarEmbeddings; // Return similarResources instead of similarEmbeddings
  };


  

export const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);

  // Fetch all embeddings
  const allEmbeddings = await vector
      .select({
          content: embeddings.content,
          embedding: embeddings.embedding,
          resourceId: embeddings.resourceId
      })
      .from(embeddings)
      .execute();

  // Calculate similarities in memory
  const similarEmbeddings = allEmbeddings
      .map(record => {
          const embeddingArray = JSON.parse(record.embedding);
          const similarity = 1 - cosineSimilarity(userQueryEmbedded, embeddingArray);
          return {
              name: record.content,
              similarity,
              resourceId: record.resourceId
          };
      })
      .filter(result => result.similarity > 0.5)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 20);

   const uniqueEmbeddingsMap = new Map<string, { resourceId: string; similarity: number }>();
  
   
    for (const embedding of similarEmbeddings) {
        const existing = uniqueEmbeddingsMap.get(embedding.resourceId);
        if (!existing || existing.similarity < embedding.similarity) {
            uniqueEmbeddingsMap.set(embedding.resourceId, { resourceId: embedding.resourceId, similarity: embedding.similarity });
        }
    }

    const uniqueEmbeddings = Array.from(uniqueEmbeddingsMap.values());
    const similarResources = await Promise.all(uniqueEmbeddings.map(async (e) => {
      const resource = await vector
        .select()
        .from(resources)
        .where(eq(resources.id, e.resourceId));
      return resource[0] || null;
    }))
    .then(results => results.filter(resource => resource !== null));

   
   

  return similarResources;
};


function cosineSimilarity(A: number[], B: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < A.length; i++) {
    dotProduct += A[i] * B[i];
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }
  return 1 - (dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)));
}




function developmentModel() {
  const lmstudio = createOpenAICompatible({
      name: 'lmstudio',
      baseURL: 'http://localhost:1234/v1',
  });
  const embeddingModel = lmstudio.textEmbeddingModel("text-embedding-nomic-embed-text-v1.5-embedding")
  return embeddingModel
}

function githubModel() {
  // const endpoint = process.env.AZURE_ENDPOINT || "https://models.inference.ai.azure.com";
  // const modelName = "text-embedding-3-small";
  // const openai = createOpenAI({
  //   apiKey: process.env.GITHUB_TOKEN,
  //   baseURL: endpoint,
  // })
  // const embeddingModel = openai.textEmbeddingModel(modelName)
  // return embeddingModel
}