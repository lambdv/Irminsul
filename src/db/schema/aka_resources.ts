import { sql } from "drizzle-orm";
import { text, varchar, timestamp, pgTable, decimal } from "drizzle-orm/pg-core";
import { z } from "zod";
import { nanoid } from "nanoid";
import { usersTable } from "./user";
import { pgEnum } from "drizzle-orm/pg-core";

export const resourceCategoryEnum = pgEnum("resource_category", [
  "document",
  "sheet",
  "website",
]);


/**
 * akadymia resource is simply a link to a resource
 * eg: google doc, google sheet, kqm site
 */
export const akaResourcesTable = pgTable("aka_resources", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: varchar("userId")
    .notNull()
    .references(() => usersTable.id),
  link: text("link")
    .notNull(),
  category: resourceCategoryEnum("category")
    .notNull(),
  tags: text("tags")
    .array()
    .default(sql`ARRAY[]::text[]`),
  source: text("source"),
  createdAt: timestamp("createdAt")
    .notNull()
    .default(sql`now()`),
});
