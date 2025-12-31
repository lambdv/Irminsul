import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import db from "@/db/db"
import { usersTable } from "@/db/schema/user"
import { accountsTable } from "@/db/schema/account"
import { sessionsTable } from "@/db/schema/session"
import { verificationTokensTable } from "@/db/schema/token"
import { eq, and, sql } from "drizzle-orm"
import { cookies } from "next/headers"
import React from "react"

const ADMIN_USER_ID = "d4882fcc-8326-4fbb-8b32-d09c0fb86875"

export async function getUser(userName: string) {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.name, userName))
  if (user.length === 0) return null
  return user[0]
}

export async function getUserById(userId: string) {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
  if (user.length === 0) return null
  return user[0]
}

export async function isAuthenticated() {
  const cookieStore = await cookies()
  let session =
    cookieStore.get("authjs.session-token") ||
    cookieStore.get("__Secure-authjs.session-token")
  if (!session) return false
  const sessionToken = session.value
  const dbSession = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.sessionToken, sessionToken))
  if (dbSession.length !== 0) return true
  return false
}

export async function getUserFromCookies() {
  const cookieStore = await cookies()
  let session =
    cookieStore.get("authjs.session-token") ||
    cookieStore.get("__Secure-authjs.session-token")
  if (!session) return null
  const sessionToken = session.value
  const dbSession = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.sessionToken, sessionToken))
  if (dbSession.length === 0) return null

  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, dbSession[0].userId))
  if (user.length === 0) return null
  return user[0]
}

export const getUserFromSession = async () => {
  const cookieStore = await cookies()
  let session =
    cookieStore.get("authjs.session-token") ||
    cookieStore.get("__Secure-authjs.session-token")
  if (!session) return null
  const sessionToken = session.value
  const dbSession = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.sessionToken, sessionToken))
  if (dbSession.length === 0) return null
  return dbSession[0]
}

export async function isSupporter(userId: string) {
  const user = await getUserById(userId)
  if (!user) return false
}

export async function isAdmin() {
  if (!(await isAuthenticated())) {
    return false
  }
  const user = await getUserFromSession()
  if (!user) return false

  if (user.userId === ADMIN_USER_ID) {
    return true
  }

  const adminRoleExists = await checkDatabaseForAdminRole(user.userId)
  return adminRoleExists
}

async function checkDatabaseForAdminRole(userId: string): Promise<boolean> {
  try {
    const { adminTable } = await import("@/db/schema/admin")
    const adminRecord = await db
      .select()
      .from(adminTable)
      .where(eq(adminTable.userId, userId))
      .limit(1)

    return adminRecord.length > 0 && adminRecord[0].role === "admin"
  } catch {
    return false
  }
}

export async function grantAdminRole(userId: string): Promise<boolean> {
  try {
    const { nanoid } = await import("nanoid")
    const adminId = nanoid()

    await db.execute(
      sql`INSERT INTO admin (id, user_id, role, created_at, updated_at) 
            VALUES (${adminId}, ${userId}, 'admin', NOW(), NOW())
            ON CONFLICT (user_id) DO UPDATE SET role = 'admin', updated_at = NOW()`
    )

    return true
  } catch (error) {
    console.error("Error granting admin role:", error)
    return false
  }
}

export async function revokeAdminRole(userId: string): Promise<boolean> {
  try {
    const { adminTable } = await import("@/db/schema/admin")
    await db
      .delete(adminTable)
      .where(and(eq(adminTable.userId, userId), eq(adminTable.role, "admin")))

    return true
  } catch (error) {
    console.error("Error revoking admin role:", error)
    return false
  }
}
