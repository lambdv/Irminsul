import { pgTable, integer, varchar, timestamp, vector, index, text } from "drizzle-orm/pg-core";
import { usersTable } from "./user";


export const aitokenTable = pgTable("aitoken", {
    userId: varchar("userId")
      .notNull()
      .references(() => usersTable.id)
      .primaryKey(),
    numTokens: integer("numTokens")
        .notNull()
  });