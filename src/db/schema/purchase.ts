import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from './user';

export const purchasesTable = pgTable('purchases', {
  id: varchar('id').primaryKey(),
  userId: varchar('user_id').notNull().references(() => usersTable.id),
  stripePaymentId: varchar('stripe_payment_id').notNull(),
  amount: integer('amount').notNull(), // amount in cents
  currency: varchar('currency').notNull().default('usd'),
  status: varchar('status').notNull().default('pending'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  productId: varchar('product_id').notNull(),
  productName: varchar('product_name').notNull(),
});

