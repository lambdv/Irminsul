import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { eq } from 'drizzle-orm';
import { usersTablePG } from './schema';
import type { InferSelectModel } from "drizzle-orm";


const db = drizzle(process.env.DATABASE_URL!)

export default db;