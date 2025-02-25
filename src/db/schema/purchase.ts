import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from './user';

export const purchasesTable = pgTable('purchases', {
  id: varchar('id').primaryKey(),
  stripePaymentId: varchar('stripe_payment_id').notNull(),
  email: varchar('email').notNull(),

  amount: integer('amount').notNull(), // amount in cents
  currency: varchar('currency').notNull().default('usd'),
  status: varchar('status').notNull(),
  createdAt: timestamp('created_at').notNull(),
  productId: varchar('product_id').notNull(),
  productName: varchar('product_name').notNull(),
});

