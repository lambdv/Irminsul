// import { drizzle } from 'drizzle-orm/better-sqlite3';
// import Database from 'better-sqlite3';
// import { join } from 'path';

// // In production, store the SQLite database in the appropriate directory
// const dbPath = process.env.NODE_ENV === 'production' 
//   ? '/data/resources.db'  // Docker volume path
//   : join(process.cwd(), 'resources.db');

// // Create/connect to SQLite database
// const sqlite = new Database(dbPath);

// // Create drizzle database instance
// export const db = drizzle(sqlite);

// // Export the raw sqlite connection for direct operations if needed
// export const sqliteConn = sqlite; 