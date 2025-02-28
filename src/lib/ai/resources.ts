'use server';

// import {
//   NewResourceParams,
//   insertResourceSchema,
//   resources,
// } from '@/db/schema/_resources';
// import db from '@/db/db';
import vector from '@/db/vector';
import { resources, insertResourceSchema, NewResourceParams } from '@/db/schema';
import { generateEmbeddings } from './embedding';
// import { embeddings as embeddingsTable } from '@/db/schema/_embeddings';
import { embeddings as embeddingsTable } from '@/db/schema';
import { encryptContent } from '@/lib/utils/encryption';

/**
 * Takes a resource, generates embeddings, and inserts both into the database.
 * @param input 
 * @returns 
 */
export const createResource = async (input: any) => {
  try {

    const { content, source } = input;
    // Encrypt the content before storing
    const encryptedContent = encryptContent(content);

    const [resource] = await vector
      .insert(resources)
      .values({ content: encryptedContent, source: source })
      .returning();
    
    console.log(resource)

    // Generate embeddings from original unencrypted content
    const embeddings = await generateEmbeddings(content);

    const res = await vector
      .insert(embeddingsTable)
      .values(
        embeddings.map(embedding => ({
          resourceId: resource?.id,
          content: encryptContent(embedding?.content), // Store encrypted chunk
          embedding: JSON.stringify(embedding?.embedding)
        }))
      );

    console.log(res)
    return 'Resource successfully created.';

  } catch (e) {
    console.log(e)
    if (e instanceof Error)
      return e.message.length > 0 ? e.message : 'Error, please try again.';
  }
};