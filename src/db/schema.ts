import { nanoid } from 'nanoid';
import { sql } from "drizzle-orm";
import { sqliteTable, text, blob } from "drizzle-orm/sqlite-core";
import { z } from 'zod';

export const resources = sqliteTable("resources", {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
  
    content: text("content").notNull(),

    source: text("source").notNull().default(""),
    
    // createdAt: text("created_at")
    //   .notNull()
    //   .default(sql`CURRENT_TIMESTAMP`),
      
    // updatedAt: text("updated_at")
    //   .notNull()
    //   .default(sql`CURRENT_TIMESTAMP`),
  });

export const embeddings = sqliteTable('embeddings', {
    id: text('id').primaryKey().$defaultFn(() => nanoid()),
    resourceId: text('resource_id').references(
        () => resources.id,
        { onDelete: 'cascade' },
    ),
    content: text('content').notNull(),
    embedding: text('embedding').notNull(),
});

// Schema for resources - used to validate API requests
export const insertResourceSchema = z.object({
  content: z.string(),
});

// Type for resources - used to type API request params and within Components
export type NewResourceParams = z.infer<typeof insertResourceSchema>;