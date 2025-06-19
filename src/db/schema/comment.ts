import { pgTable, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const commentsTable = pgTable("comments", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    page: varchar("page").notNull(),
    userId: varchar("userId").notNull().references(() => usersTable.id),
    comment: varchar("comment").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull()
});
