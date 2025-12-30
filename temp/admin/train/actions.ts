import db from "@root/src/db/db"
import { eq } from "drizzle-orm"
import { resources as resourcesTable } from "@root/src/db/schema/resources"
import { embeddings as embeddingsTable } from "@root/src/db/schema/embeddings"


export async function deleteResource(resourceId: string) {
    await db.delete(resourcesTable).where(eq(resourcesTable.id, resourceId))
    await db.delete(embeddingsTable).where(eq(embeddingsTable.resourceId, resourceId))  
}
