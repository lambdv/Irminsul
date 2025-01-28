import { pgTable, integer, varchar, timestamp, vector, index, text } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const sessionsTable = pgTable("session", {
    sessionToken: varchar("sessionToken").primaryKey(),
    userId: varchar("userId")
      .notNull()
      .references(() => usersTable.id),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  });
  