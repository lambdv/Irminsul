import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { join } from 'path';
import type { Config } from "drizzle-kit";

export default defineConfig({
  out: './drizzle/sqlite',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  
  dbCredentials: {
    url: process.env.DB_FILE_NAME,
  },
});
