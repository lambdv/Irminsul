import { pgTable, varchar, timestamp, text } from "drizzle-orm/pg-core"
import { usersTable } from "./user"
import { nanoid } from "nanoid"

export const conversationTable = pgTable("conversation", {
  id: varchar("id").primaryKey(),
  userId: varchar("userId").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})
