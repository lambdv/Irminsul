import { pgTable, integer, varchar, timestamp, vector, index, text } from "drizzle-orm/pg-core";
import { usersTable } from "./user";


export const accountsTable = pgTable("account", {
    // id: varchar("id").primaryKey(),
    userId: varchar("userId")
      .notNull()
      .references(() => usersTable.id),
    type: varchar("type").$type<"oauth" | "oidc" | "email">().notNull(),
    provider: varchar("provider").notNull(),
    providerAccountId: varchar("providerAccountId").notNull(),
    refresh_token: varchar("refresh_token"),
    access_token: varchar("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type"),
    scope: varchar("scope"),
    id_token: varchar("id_token"),
    session_state: varchar("session_state"),
  });