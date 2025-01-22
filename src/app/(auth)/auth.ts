import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import db from "@/db/db"
import { usersTablePG, accountsTablePG, sessionsTablePG, verificationTokensTablePG } from "@/db/schema"
 
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