import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("user", {
    id: varchar("id").primaryKey(),
    name: varchar("name"),
    email: varchar("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: varchar("image"),
  });