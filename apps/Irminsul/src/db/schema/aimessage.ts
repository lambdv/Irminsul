import { pgTable, integer, varchar, timestamp, vector, index, text } from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { nanoid } from "nanoid";

export const aimessageTable = pgTable("aimessage", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: varchar("userId")
    .notNull(),
  prompt: text("prompt")
    .notNull(),
  response: text("response")
    .notNull(),
  createdAt: timestamp("createdAt")
    .notNull()
    .defaultNow()
  });