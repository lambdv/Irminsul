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
import { cookies } from "next/headers"
import React from "react"
 
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

export async function getUser(userName: string){
  const user = await db.select().from(usersTable).where(eq(usersTable.name, userName))
  if(user.length === 0) return null
  return user[0]
}

export async function getUserById(userId: string){
  const user = await db.select().from(usersTable).where(eq(usersTable.id, userId))
  if(user.length === 0) return null
  return user[0]
}


/**
 * uses cookies from the header to check if user has a valid session token
 */
export async function isAuthenticated(){
  const cookieStore = await cookies()
  let session = cookieStore.get('authjs.session-token') || cookieStore.get('__Secure-authjs.session-token')
  //check if session cookie exists
  if(!session) 
    return false
  //verify session token
  const sessionToken = session.value
  const dbSession = await db.select().from(sessionsTable).where(eq(sessionsTable.sessionToken, sessionToken))
  if(dbSession.length !== 0) 
    return true
  return false
}


export const getUserFromSession = async () => {
  const cookieStore = await cookies()
  let session = cookieStore.get('authjs.session-token') || cookieStore.get('__Secure-authjs.session-token')
  if(!session) return null
  const sessionToken = session.value
  const dbSession = await db.select().from(sessionsTable).where(eq(sessionsTable.sessionToken, sessionToken))
  if(dbSession.length === 0) return null
  return dbSession[0]
}
