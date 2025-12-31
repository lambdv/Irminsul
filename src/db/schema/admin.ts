import { pgTable, varchar, timestamp, text } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { usersTable } from "./user"

export const adminTable = pgTable("admin", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  role: varchar("role", { enum: ["admin", "moderator"] })
    .notNull()
    .default("admin"),
  permissions: text("permissions").array(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const adminRelations = relations(adminTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [adminTable.userId],
    references: [usersTable.id],
  }),
}))
