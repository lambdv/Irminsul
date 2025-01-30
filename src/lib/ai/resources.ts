'use server';

import {
  NewResourceParams,
  insertResourceSchema,
  resources,
} from '@/db/schema/resources';
import db from '@/db/db';

import { generateEmbeddings } from './embedding';
import { embeddings as embeddingsTable } from '@/db/schema/embeddings';

export const createResource = async (input: NewResourceParams) => {
  try {
    const { content } = insertResourceSchema.parse(input);

    const [resource] = await db.insert(resources).values({ content }).returning();
    console.log(resource)

    const embeddings = await generateEmbeddings(content);
    // console.log(embeddings)
      
    const res = await db.insert(embeddingsTable).values(
      embeddings.map(embedding => ({
        resourceId: resource.id,
        ...embedding,
      })),
    );
    console.log(res)
    
    console.log("Resource successfully created.")
    return 'Resource successfully created.';
  } catch (e) {
    console.log(e)
    if (e instanceof Error)
      return e.message.length > 0 ? e.message : 'Error, please try again.';
  }
};