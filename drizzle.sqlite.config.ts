import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { join } from 'path';

export default defineConfig({
  out: './drizzle/sqlite',
  schema: './src/db/schema/resources.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.NODE_ENV === 'production' 
      ? 'file:///data/resources.db'
      : `file://${join(process.cwd(), 'resources.db')}`,
  },
}); 