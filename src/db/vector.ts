import { nanoid } from 'nanoid';
import { sql } from "drizzle-orm";
import { z } from "zod";
import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { join } from 'path';

// Create a better-sqlite3 database instance
const sqlite = new Database(join(process.cwd(), process.env.DB_FILE_NAME!));

// Create a drizzle database instance
const vector = drizzle(sqlite);

export default vector;