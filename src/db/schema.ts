import { sqliteTable, int, text as sqliteText, real } from "drizzle-orm/sqlite-core";
import { pgTable, integer, varchar, timestamp, vector, index, text } from "drizzle-orm/pg-core";
import { nanoid } from 'nanoid';
  

// export const usersTable = sqliteTable("users_table", {
//   id:   int().primaryKey({ autoIncrement: true }),
//   username: text().notNull(),
//   email: text().notNull().unique(),
//   password: text().notNull(),
//   createdAt: real().notNull(),
// });

/**
 * users table
 */
export const usersTablePG = pgTable("user", {
  id: varchar("id").primaryKey(),
  name: varchar("name"),
  email: varchar("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: varchar("image"),
});

// export const commentsTableBG = pgTable("comments", {
//   id: integer().primaryKey().generatedAlwaysAsIdentity(),
//   page: varchar("page").notNull(),
//   userId: varchar("userId").references(() => usersTablePG.id),
//   comment: varchar("comment").notNull(),
//   createdAt: timestamp("created_at", { mode: "date" }).notNull()
// });

/**
 * comments table
 */
export const commentsTableBG = pgTable("comments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  page: varchar("page").notNull(),
  userId: varchar("userId").notNull().references(() => usersTablePG.id),
  comment: varchar("comment").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull()
});

/**
 * accounts table
 */
export const accountsTablePG = pgTable("account", {
  // id: varchar("id").primaryKey(),
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

/**
 * sessions table
 */
export const sessionsTablePG = pgTable("session", {
  sessionToken: varchar("sessionToken").primaryKey(),
  userId: varchar("userId")
    .notNull()
    .references(() => usersTablePG.id),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

/**
 * verification tokens table
 */
export const verificationTokensTablePG = pgTable("verificationToken", {
  // id: varchar("id").primaryKey(),
  identifier: varchar("identifier").notNull(),
  token: varchar("token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})



// export const payingUsersTable = pgTable("paying_users", {
//   id: varchar("id").primaryKey(),
//   userId: varchar("userId").notNull().references(() => usersTablePG.id),
//   createdAt: timestamp("created_at", { mode: "date" }).notNull(),
//   stripeCustomerId: varchar("stripeCustomerId").notNull(),
//   stripeSubscriptionId: varchar("stripeSubscriptionId").notNull(),
//   stripePriceId: varchar("stripePriceId").notNull(),
//   stripeCurrentPeriodEnd: timestamp("stripeCurrentPeriodEnd", { mode: "date" }).notNull(),
// })


// export const userAiTokensTable = pgTable("user_ai_tokens", {
//   id: varchar("id").primaryKey(),
//   userId: varchar("userId").notNull().references(() => usersTablePG.id),
//   createdAt: timestamp("created_at", { mode: "date" }).notNull(),
//   aiTokensLeft: integer("aiTokens").notNull(),
//   lastUsedAt: timestamp("last_used_at", { mode: "date" }).notNull(),
  
// })

export const resources = pgTable("resources", {
    id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
    title: varchar("title").notNull(),
    content: text("content").notNull(),
});

export const embeddings = pgTable("embeddings", {
    id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
    resourceId: varchar("resource_id").references(() => resources.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
}, (table) => ({
    embeddingIndex: index("embedding_idx").on(table.embedding),
}));