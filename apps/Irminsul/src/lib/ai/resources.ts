'use server';

// import vector from '@/db/vector';
// import { resources, insertResourceSchema, NewResourceParams } from '@/db/schema';
import db from '@/db/db';
import { resources, insertResourceSchema, NewResourceParams } from '@/db/schema/resources';
import { embeddings as embeddingsTable } from '@/db/schema/embeddings';
import { generateEmbeddings } from './embedding';

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
      tags,
    } = input;
    // Encrypt the content before storing
    // const encryptedContent = encryptContent(content);

    const obj = {
      content: content,
      source: source,
      type: type,
      date: new Date(date),
      weight: weight,
      tags: tags,
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