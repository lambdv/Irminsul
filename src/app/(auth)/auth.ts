import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import db from "@/db/db"
import { usersTablePG, accountsTablePG, sessionsTablePG, verificationTokensTablePG } from "@/db/schema"
import { eq } from "drizzle-orm"
 
const adapter = DrizzleAdapter(db, {
  usersTable: usersTablePG,
  accountsTable: accountsTablePG,
  sessionsTable: sessionsTablePG,
  verificationTokensTable: verificationTokensTablePG,
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: adapter,
  providers: [
    DiscordProvider
  ],
})

export async function isAuthenticated(): Promise<boolean> {
  try{
    const session = await auth()
    return session !== null
  } catch (error) {
    return false
  }

}

export async function getUser(userName: string){
  const user = await db.select().from(usersTablePG).where(eq(usersTablePG.name, userName))
  if(user.length === 0) return null
  return user[0]
}

