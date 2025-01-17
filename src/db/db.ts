import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { usersTablePG } from './schema';
  
const db = drizzle(process.env.DATABASE_URL!)

export default db;