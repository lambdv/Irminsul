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
export const createResource = async (input: { 
  content: string, 
  source: string,
  type: string,
  date: string,
  weight: any,
  tags: string[]
}) => {
  try {
    console.log("creating resource...")
  const obj = {
    content: input.content,
    source: input.source,
    type: input.type,
    date: new Date(input.date),
    weight: input.weight,
    tags: input.tags,
  }

  // Generate embeddings from original unencrypted content
  const embeddings = await generateEmbeddings(input.content);

  if (embeddings.length === 0) {
    throw new Error('No embeddings generated');
  }

  const [resource] = await db
  .insert(resources)
  .values(obj)
  .returning();

  console.log(resource)

  const res = await db
    .insert(embeddingsTable)
    .values(
      embeddings.map(embedding => ({
        resourceId: resource?.id,
        ...embedding
      }))
    );
  console.log(res)
  console.log("resource created!")
  return 'Resource successfully created.';

  } 
  catch (e) {
    console.log(e)
    if (e instanceof Error) return e.message.length > 0 ? e.message : 'Error, please try again.';
  }
};