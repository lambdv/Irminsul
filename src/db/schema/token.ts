import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const verificationTokensTable = pgTable("verificationToken", {
  // id: varchar("id").primaryKey(),
  identifier: varchar("identifier").notNull(),
  token: varchar("token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})
