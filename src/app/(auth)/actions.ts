import { auth, currentUser } from "@clerk/nextjs/server"
import db from "@/db/db"
import { usersTable } from "@/db/schema/user"
import { eq, and, sql } from "drizzle-orm"

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
  const { userId } = await auth()
  return !!userId
}

export async function getUserFromCookies() {
  const clerkUser = await currentUser()
  if (!clerkUser) return null
  
  // Try to find user in local database by Clerk ID first
  let user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, clerkUser.id))
    .limit(1)
  
  if (user.length > 0) return user[0]
  
  // If not found by ID, try by email
  const email = clerkUser.emailAddresses[0]?.emailAddress
  if (email) {
    user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)
    
    if (user.length > 0) return user[0]
  }
  
  // If user doesn't exist in local DB, return Clerk user data structure
  // This maintains compatibility while migrating
  return {
    id: clerkUser.id,
    email: email || null,
    name: clerkUser.fullName || clerkUser.firstName || null,
    image: clerkUser.imageUrl || null,
  }
}

export const getUserFromSession = async () => {
  const { userId } = await auth()
  if (!userId) return null
  
  // Return a session-like object for compatibility
  return {
    userId,
    sessionToken: userId, // Using userId as session identifier
  }
}

export async function isSupporter(userId: string) {
  const user = await getUserById(userId)
  if (!user) return false
}

export async function isAdmin() {
  const { userId } = await auth()
  if (!userId) return false

  if (userId === ADMIN_USER_ID) {
    return true
  }

  const adminRoleExists = await checkDatabaseForAdminRole(userId)
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
