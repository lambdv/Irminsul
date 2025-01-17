import { sqliteTable, int, text, real } from "drizzle-orm/sqlite-core";
import { pgTable, integer, varchar, timestamp } from "drizzle-orm/pg-core";

// export const usersTable = sqliteTable("users_table", {
//   id:   int().primaryKey({ autoIncrement: true }),
//   username: text().notNull(),
//   email: text().notNull().unique(),
//   password: text().notNull(),
//   createdAt: real().notNull(),
// });

export const usersTablePG = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar().notNull(),
  email: varchar().notNull().unique(),
  password: varchar().notNull(),
  createdAt: timestamp("created_at").notNull(),
});


export const commentsTableBG = pgTable("comments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  page: varchar().notNull(),
  userid: integer().references(() => usersTablePG.id),
  comment: varchar().notNull(),
  createdAt: timestamp("created_at").notNull()
})