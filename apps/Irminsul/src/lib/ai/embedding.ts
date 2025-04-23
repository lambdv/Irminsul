import { embed, embedMany } from 'ai';
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import db from '@/db/db';
import { cosineDistance, desc, gt, eq, sql } from 'drizzle-orm';
import { embeddings } from '@/db/schema/embeddings';
import { resources } from '@/db/schema/resources';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
// import vector from '@/db/vector';
// import { embeddings } from '@/db/schema';
// import { resources } from '@/db/schema';

const similarityThreshold = 0.0

const token = process.env.AISTUDIO_GOOGLE_API_KEY
const google = createGoogleGenerativeAI({
  apiKey: token
})

const embeddingModel = google.textEmbeddingModel('gemini-embedding-exp-03-07', {
  outputDimensionality: 1536
});

function simpleChunker(text: string): string[] {
  return text
    .split("%%%")
    .map(s => s.trim())
    .map(s => s.replaceAll("\r", " "))
    .map(s => s.replaceAll("\n", " "))
    .map(s => s.replaceAll(/\s+/g, " "))
}

export const generateEmbeddings = async (value: string): Promise<Array<{ embedding: number[]; content: string }>> => {
  try{
 
    const chunks = simpleChunker(value)
    console.log("chunks", chunks)

    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: chunks,
      maxRetries: 3
    });
    console.log("embeddings generated!")
    return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
  }
  catch(e){
    console.log(e)
    return []
  }


};


export const generateEmbedding = async (value: string): Promise<number[]> => {
    const input = value.replaceAll('\\n', ' ');
    const { embedding } = await embed({
      model: embeddingModel,
      value: input,
    });
    return embedding;
  };
  

  export const findRelevantContent = async (userQuery: string, returnFullDocument = false): Promise<any[]> => {
    const userQueryEmbedded = await generateEmbedding(userQuery);
    const similarity = sql<number>`1 - (${cosineDistance(
      embeddings.embedding,
      userQueryEmbedded,
    )})`;

    const similarEmbeddings = await db
      .select({ 
        resourceId: embeddings.resourceId,
        content: embeddings.content,
        similarity
            })
      .from(embeddings)
      .where(gt(similarity, similarityThreshold))
      .orderBy(t => desc(t.similarity))
      .limit(4);

    // if (!returnFullDocument)
    //    return similarEmbeddings

    
    //Get the full resource content for each matching embedding
    const resourcePromises = similarEmbeddings.map(async (item) => {
      const resource = await db
        .select({
          content: resources.content,
          source: resources.source,
          date: resources.date,
          id: resources.id,
          weight: resources.weight,
          type: resources.type
        })
        .from(resources)
        .where(eq(resources.id, item.resourceId));
      
      return {
        id: resource[0]?.id,
        content: resource[0]?.content || "",
        similarity: item.similarity,
        source: resource[0]?.source || "",
        date: resource[0]?.date,
        weight: resource[0]?.weight || 1,
        type: resource[0]?.type || ""
      };
    });
    const fetchedResources = await Promise.all(resourcePromises);
    const relevantResources = fetchedResources
      .map(r => ({
        ...r,
        similarity: r.similarity * (typeof r.weight === 'string' ? parseFloat(r.weight) : r.weight)
      }))
      .sort((a, b) => {
        const similarityDiff = ((b.similarity) - (a.similarity));
        if(Math.abs(similarityDiff) < 0.1) 
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        return similarityDiff;
      })
      .reduce((acc, curr) => {
        if(acc.find((r) => r.id === curr.id)) {
          return acc;
        }
        return [...acc, curr];
      }, [])
      .slice(0, 20);

    return relevantResources;
  };

// export const findRelevantContent = async (userQuery: string) => {
//   const userQueryEmbedded = await generateEmbedding(userQuery);

//   // Calculate similarity directly in SQLite using cosine distance
//   const similarity = sql<number>`1 - (${cosineDistance(
//     embeddings.embedding,
//     userQueryEmbedded
//   )})`.as('similarity');

//   // For SQLite, we need to parse the embedding JSON string and calculate similarity in JS
//   const relevantResources = await vector
//     .select({
//       id: resources.id,
//       content: resources.content,
//       source: resources.source,
//       embedding: embeddings.embedding,
//       weight: resources.weight,
//       type: resources.type,
//       date: resources.date,
//     })
//     .from(embeddings)
//     .innerJoin(resources, eq(embeddings.resourceId, resources.id))
//     .execute();


//     function cosineSimilarity(A: number[], B: number[]): number {
//       let dotProduct = 0;
//       let normA = 0;
//       let normB = 0;
//       for (let i = 0; i < A.length; i++) {
//         dotProduct += A[i] * B[i];
//         normA += A[i] * A[i];
//         normB += B[i] * B[i];
//       }
//       return 1 - (dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)));
//     }

//   // Calculate similarities in JS and sort/filter results
//   const processedResults = relevantResources
//     .map(resource => ({
//       ...resource,
//       similarity: 1 - cosineSimilarity(userQueryEmbedded,JSON.parse(resource.embedding))
//     }))
//     .filter(resource => resource.similarity > 0.5)
//     .map(resource => ({
//       ...resource,
//       similarity: resource.similarity * resource.weight
//     }))
//     .sort((a, b) => {
//       const similarityDiff = ((b.similarity) - (a.similarity))
//       if(Math.abs(similarityDiff) < 0.1) 
//         return new Date(b.date).getTime() - new Date(a.date).getTime();
//       return similarityDiff;
//     })
//     .slice(0, 20)

//     //reduce duplicates
//     .reduce((acc, curr) => {
//       const existing = acc.find(r => r.id === curr.id);
//       if(existing) {
//         return acc;
//       }
//       return [...acc, curr];
//     }, []);
//   // Decrypt contents after fetching
//   return processedResults.map(resource => ({
//     id: resource.id,
//     source: resource.source,
//     similarity: resource.similarity,
//     date: resource.date,
//     content: decryptContent(resource.content),
//   }));
// };





// function developmentModel() {
//   const lmstudio = createOpenAICompatible({
//       name: 'lmstudio',
//       baseURL: 'http://localhost:1234/v1',
//   });
//   const embeddingModel = lmstudio.textEmbeddingModel("text-embedding-nomic-embed-text-v1.5-embedding")
//   return embeddingModel
// }

//function githubModel() {
  // const endpoint = process.env.AZURE_ENDPOINT || "https://models.inference.ai.azure.com";
  // const modelName = "text-embedding-3-small";
  // const openai = createOpenAI({
  //   apiKey: process.env.GITHUB_TOKEN,
  //   baseURL: endpoint,
  // })
  // const embeddingModel = openai.textEmbeddingModel(modelName)
  // return embeddingModel
///}


// export const findRelevantContentOld = async (userQuery: string) => {
//   const userQueryEmbedded = await generateEmbedding(userQuery);

//   console.log("userQueryEmbedded", userQueryEmbedded)

//   const similarity = sql<number>`1 - (${cosineDistance(
//     embeddings.embedding,
//     userQueryEmbedded,
//   )})`;

//   console.log("embeddings.embedding", embeddings.embedding)


//   console.log(embeddings2.embedding)
//   const similarEmbeddings = await db
//     .select({
//       name: embeddings2.content,
//       similarity
//     })
//     .from(embeddings2)
//     .where(gt(similarity, 0.5))
//     .orderBy(desc(similarity))
//     .limit(20)
//     .execute();


//   console.log("similarEmbeddings", similarEmbeddings)
  

//   // const uniqueEmbeddingsMap = new Map<string, { resourceId: string; similarity: number }>();
//   // for (const embedding of similarEmbeddings) {
//   //     const existing = uniqueEmbeddingsMap.get(embedding.resourceId);
//   //     if (!existing || existing.similarity < embedding.similarity) {
//   //         uniqueEmbeddingsMap.set(embedding.resourceId, { resourceId: embedding.resourceId, similarity: embedding.similarity });
//   //     }
//   // }
//   // const uniqueEmbeddings = Array.from(uniqueEmbeddingsMap.values());
//   // const similarResources = await Promise.all(uniqueEmbeddings.map(async (e) => {
//   //   const resource = await vector
//   //     .select()
//   //     .from(resources)
//   //     .where(eq(resources.id, e.resourceId));
//   //   return resource[0] || null;
//   // }))
//   // .then(results => results.filter(resource => resource !== null));


//   return similarEmbeddings; // Return similarResources instead of similarEmbeddings
// };
