import { eq, sql, and } from "drizzle-orm"
import db from "@/db/db"
import { aitokenTable } from "@/db/schema/aitoken"
import { usersTable } from "@/db/schema/user"
import { nanoid } from "nanoid"

/**
 * Get client IP address from request headers
 * Note: This function needs to be called in an API route context
 * @param request Request object (optional, will try to get from headers if not provided)
 * @returns IP address string
 */
async function getClientIP(request?: Request): Promise<string> {
  try {
    // If request is provided, try to get IP from it
    if (request) {
      const forwardedFor = request.headers.get("x-forwarded-for")
      const realIP = request.headers.get("x-real-ip")
      const cfConnectingIP = request.headers.get("cf-connecting-ip")

      if (forwardedFor) {
        return forwardedFor.split(",")[0].trim()
      }
      if (realIP) {
        return realIP.trim()
      }
      if (cfConnectingIP) {
        return cfConnectingIP.trim()
      }
    }

    // Fallback to trying to get headers (might not work in all contexts)
    const { headers } = await import("next/headers")
    const headersList = await headers()
    const forwardedFor = headersList.get("x-forwarded-for")
    const realIP = headersList.get("x-real-ip")
    const cfConnectingIP = headersList.get("cf-connecting-ip")

    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim()
    }
    if (realIP) {
      return realIP.trim()
    }
    if (cfConnectingIP) {
      return cfConnectingIP.trim()
    }
  } catch (error) {
    // Headers might not be available in all contexts
  }

  return "127.0.0.1" // fallback for local development
}

/**
 * Get the number of AI tokens left for a user/IP combination
 * @param userId user id
 * @param request Request object (optional)
 * @returns number of tokens left
 */
export async function getAiTokensLeft(userId: string, request?: Request) {
  const ipAddress = await getClientIP(request)

  //get user from db
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))

  if (user.length <= 0) return 0

  // Look for existing token record for this IP
  let tokenRecord = await db
    .select()
    .from(aitokenTable)
    .where(eq(aitokenTable.ipAddress, ipAddress))

  // If no record exists for this IP, create one with 20 free tokens
  if (tokenRecord.length <= 0) {
    return await insertAiToken(userId, ipAddress, 20)
  }

  // Associate user with existing IP token record if not already associated
  if (!tokenRecord[0].userId) {
    await db
      .update(aitokenTable)
      .set({ userId: userId } as any)
      .where(eq(aitokenTable.ipAddress, ipAddress))
  }

  let numTokens = tokenRecord[0].numTokens
  return Math.max(numTokens, 0)
}

/**
 * Insert a new AI token record for an IP address (and optionally user)
 * @param userId user id (optional)
 * @param ipAddress IP address
 * @param numTokens number of tokens
 * @returns number of tokens
 */
async function insertAiToken(
  userId: string,
  ipAddress: string,
  numTokens: number
) {
  await db.insert(aitokenTable).values({
    id: nanoid(),
    userId: userId || null,
    ipAddress: ipAddress,
    numTokens: numTokens,
    type: "free",
  } as any)
  return numTokens
}

/**
 * Consume AI tokens for an IP address
 * @param userId user id (used for IP lookup)
 * @param amount number of tokens to consume
 * @param request Request object (optional)
 * @returns number of tokens left after consumption, or null if insufficient tokens
 */
export async function consumeAiTokens(
  userId: string,
  amount: number,
  request?: Request
) {
  const ipAddress = await getClientIP(request)
  const tokensLeft = await getAiTokensLeft(userId, request)
  if (tokensLeft < amount) return null

  await db
    .update(aitokenTable)
    .set({ numTokens: sql`${aitokenTable.numTokens} - ${amount}` } as any)
    .where(eq(aitokenTable.ipAddress, ipAddress))

  return tokensLeft - amount
}
