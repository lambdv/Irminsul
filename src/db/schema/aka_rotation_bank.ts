import { sql } from "drizzle-orm";
import { text, varchar, timestamp, pgTable, decimal } from "drizzle-orm/pg-core";
import { z } from "zod";
import { nanoid } from "nanoid";
import { usersTable } from "./user";
import { pgEnum } from "drizzle-orm/pg-core";

/**
 * akadymia resource is simply a link to a resource
 * eg: google doc, google sheet, kqm site
 */
export const akaRotationBankTable = pgTable("aka_rotation_bank", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: varchar("userId")
    .notNull()
    .references(() => usersTable.id),
  rotation: text("rotation")
    .notNull(),
  
  character1: text("character1")  
    .notNull(),
  character2: text("character2")
    .notNull(),
  character3: text("character3")
    .notNull(),
  character4: text("character4")
    .notNull(),

  title: text("title"),
  description: text("description"),
  source: text("source"),
  tags: text("tags")
    .array()
    .default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("createdAt")
    .notNull()
    .default(sql`now()`),
});
