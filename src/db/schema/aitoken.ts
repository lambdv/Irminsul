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

export const aitokenTable = pgTable("aitoken", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("userId").references(() => usersTable.id),
  ipAddress: varchar("ipAddress").notNull(),
  numTokens: integer("numTokens").notNull().default(20),
  type: varchar("type").notNull().default("free"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
})
