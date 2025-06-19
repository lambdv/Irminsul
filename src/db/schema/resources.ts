import { sql } from "drizzle-orm";
import { text, varchar, timestamp, pgTable, decimal } from "drizzle-orm/pg-core";
import { z } from "zod";

import { nanoid } from "nanoid";

export const resources = pgTable("resources", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),

  content: text("content").notNull(),

  source: text("source").default(""),

  weight: decimal("weight")
    .notNull(),
  
  type: text("type")
    .notNull(),

  date: timestamp("date")
    .notNull()
    .default(sql`now()`),

  tags: text("tags")
    .array()
    .default(sql`ARRAY[]::text[]`),
});

// Schema for resources - used to validate API requests
export const insertResourceSchema = z.object({
  content: z.string(),
});

// Type for resources - used to type API request params and within Components
export type NewResourceParams = z.infer<typeof insertResourceSchema>;