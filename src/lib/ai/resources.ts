'use server';

// import vector from '@/db/vector';
// import { resources, insertResourceSchema, NewResourceParams } from '@/db/schema';
import db from '@/db/db';
import { resources, insertResourceSchema, NewResourceParams } from '@/db/schema/resources';
import { embeddings as embeddingsTable } from '@/db/schema/embeddings';
import { generateEmbeddings } from './embedding';
// import { encryptContent } from '@/lib/utils/encryption';

/**
 * Takes a resource, generates embeddings, and inserts both into the database.
 * @param input 
 * @returns 
 */
export const createResource = async (input: any) => {
  try {
    const { 
      content, 
      source,
      type,
      date,
      weight,
    } = input;
    // Encrypt the content before storing
    // const encryptedContent = encryptContent(content);


    const obj = {
      content: content,
      source: source,
    }

    const [resource] = await db
      .insert(resources)
      .values(obj)
      .returning();
    
    console.log(resource)

    // Generate embeddings from original unencrypted content
    const embeddings = await generateEmbeddings(content);

    const res = await db
      .insert(embeddingsTable)
      .values(
        embeddings.map(embedding => ({
          resourceId: resource?.id,
          ...embedding
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