import { sqliteTable, int, text, real } from "drizzle-orm/sqlite-core";
import { pgTable, integer, varchar, timestamp } from "drizzle-orm/pg-core";

// export const usersTable = sqliteTable("users_table", {
//   id:   int().primaryKey({ autoIncrement: true }),
//   username: text().notNull(),
//   email: text().notNull().unique(),
//   password: text().notNull(),
//   createdAt: real().notNull(),
// });

export const usersTablePG = pgTable("user", {
  id: varchar("id").primaryKey(),
  name: varchar("name"),
  email: varchar("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: varchar("image"),
});

export const commentsTableBG = pgTable("comments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  page: varchar("page").notNull(),
  userId: varchar("userId").references(() => usersTablePG.id),
  comment: varchar("comment").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull()
});

export const accountsTablePG = pgTable("account", {
  userId: varchar("userId")
    .notNull()
    .references(() => usersTablePG.id),
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

export const sessionsTablePG = pgTable("session", {
  sessionToken: varchar("sessionToken").primaryKey(),
  userId: varchar("userId")
    .notNull()
    .references(() => usersTablePG.id),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokensTablePG = pgTable("verificationToken", {
  identifier: varchar("identifier").notNull(),
  token: varchar("token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})