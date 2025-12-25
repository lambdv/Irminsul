import {
  pgTable,
  integer,
  varchar,
  timestamp,
  vector,
  index,
  text,
} from "drizzle-orm/pg-core"
import { usersTable } from "./user"
import { conversationTable } from "./conversation"
import { nanoid } from "nanoid"

export const aimessageTable = pgTable("aimessage", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: varchar("userId").notNull(),
  conversationId: varchar("conversationId")
    .notNull()
    .references(() => conversationTable.id, { onDelete: "cascade" }),
  role: varchar("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
