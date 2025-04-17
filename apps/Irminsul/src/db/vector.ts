// import { nanoid } from 'nanoid';
// import { sql } from "drizzle-orm";
// import { z } from "zod";
// import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
// import Database from 'better-sqlite3';
// import { drizzle } from 'drizzle-orm/better-sqlite3';
// import { join } from 'path';

// // Create a better-sqlite3 database instance
// const sqlite = new Database(join(process.cwd(), "src/db/vector.db"));

// // Create a drizzle database instance
// const vector = drizzle(sqlite);

// export default vector;

// // export const resources = sqliteTable("resources", {
// //     id: text("id")
// //       .primaryKey()
// //       .$defaultFn(() => nanoid()),
  
// //     content: text("content").notNull(),
// //     source: text("source").notNull(),
// //     date: text("date").notNull(),
// //     weight: integer("weight").notNull(),
// //     type: text("type").notNull()
// // });

// // export const embeddings = sqliteTable('embeddings', {
// //     id: text('id').primaryKey().$defaultFn(() => nanoid()),
// //     resourceId: text('resource_id').references(
// //         () => resources.id,
// //         { onDelete: 'cascade' },
// //     ),
// //     content: text('content').notNull(),
// //     embedding: text('embedding').notNull(),
// // });

// // // Schema for resources - used to validate API requests
// // export const insertResourceSchema = z.object({
// //   content: z.string(),
// // });

// // // Type for resources - used to type API request params and within Components
// // export type NewResourceParams = z.infer<typeof insertResourceSchema>;