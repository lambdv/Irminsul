import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import db from "@/db/db"
// import { usersTable, accountsTable, sessionsTable, verificationTokensTable } from "@/db/schema"
import { usersTable } from "@/db/schema/user"
import { accountsTable } from "@/db/schema/account"
import { sessionsTable } from "@/db/schema/session"
import { verificationTokensTable } from "@/db/schema/token"
import { eq } from "drizzle-orm"
import React from "react"
import { redirect } from "next/navigation"
 
const adapter = DrizzleAdapter(db, {
  usersTable: usersTable,
  accountsTable: accountsTable,
  sessionsTable: sessionsTable,
  verificationTokensTable: verificationTokensTable,
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: adapter,
  providers: [
    DiscordProvider
  ],
  pages: {
    signIn: '/login',
    // signOut: '/auth/signout',
    // error: '/auth/error',
    // verifyRequest: '/auth/verify-request',
    // newUser: '/auth/new-user'
  }
})
