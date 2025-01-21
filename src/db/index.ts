import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
//import { usersTable } from './schema';
import { eq } from 'drizzle-orm';
import { usersTablePG } from './schema';
  
const db = drizzle(process.env.DATABASE_URL!)

async function main() {
//   const user: typeof usersTablePG.$inferInsert = {
//     username: 'John',
//     email: 'john@example.com',
//     password: 'password',
//     createdAt: new Date(),
//   };

//   await db.insert(usersTablePG).values(user);
//   console.log('New user created!')

  const users = await db.select().from(usersTablePG);
  console.log('Getting all users from the database: ', users)


//   await db
//     .update(usersTable)
//     .set({
//       username: 'John',
//     })
//     .where(eq(usersTable.email, user.email));
//   console.log('User info updated!')

//   await db.delete(usersTable).where(eq(usersTable.email, user.email));
//   console.log('User deleted!')
}

//main();
