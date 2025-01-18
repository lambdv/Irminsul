import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import db from "@/db/db"
import { usersTablePG, accountsTablePG, sessionsTablePG, verificationTokensTablePG } from "@/db/schema"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  adapter: DrizzleAdapter(db, {
    usersTable: usersTablePG,
    accountsTable: accountsTablePG,
    sessionsTable: sessionsTablePG,
    verificationTokensTable: verificationTokensTablePG,
  }),
  providers: [
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
})