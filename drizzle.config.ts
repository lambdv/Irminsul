import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema/*.ts',
  //dialect: 'sqlite',
  dialect: 'postgresql',
  dbCredentials: {
    //url: process.env.DB_FILE_NAME!,
    url: process.env.DATABASE_URL!,
  },
});
