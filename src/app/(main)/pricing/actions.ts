import { stripe } from "@/lib/stripe"
import db from "@/db/db"
import { purchasesTable } from "@/db/schema/purchase"
import { eq, desc } from "drizzle-orm"
import { getUserById } from "@/app/(auth)/actions"
import { usersTable } from "@/db/schema/user"
import { aitokenTable } from "@/db/schema/aitoken"

export async function syncStripePayments() {
  const payments = await stripe.paymentIntents.list()

  for (const payment of payments.data) {
    const data = await db
      .select()
      .from(purchasesTable)
      .where(eq(purchasesTable.stripePaymentId, payment.id))
    const existingPayment = data[0]

    //if payment is already in the database and status is succeeded, then skip
    if (existingPayment && existingPayment.status === "succeeded") continue

    //if payment is already in the database and status is not succeeded, then update the status to succeeded
    if (
      existingPayment &&
      payment.status === "succeeded" &&
      existingPayment.status !== "succeeded"
    ) {
      await db
        .update(purchasesTable)
        .set({ status: "succeeded" })
        .where(eq(purchasesTable.stripePaymentId, payment.id))
      await claimAiTokensFromPurchase(existingPayment)
    }

    //check if payment is already in the database via id using drizzle orm
    if (
      !existingPayment &&
      payment.status === "succeeded" &&
      payment.receipt_email
    ) {
      const newPayment = await db.insert(purchasesTable).values({
        id: crypto.randomUUID(),
        stripePaymentId: payment.id,
        email: payment.receipt_email,
        amount: payment.amount,
        productId: "supporter_tier",
        productName: "Supporter Tier",
        createdAt: new Date(payment.created * 1000),
        status: "succeeded",
      })
      await claimAiTokensFromPurchase(payment)
    }
  }
}

export const BASE_TIER_TOKEN_AMOUNT = 200
export const SUPPORT_TIER_TOKEN_AMOUNT = 500
export const PRO_TIER_TOKEN_AMOUNT = 200 // Total for Pro tier
export const ULTRA_TIER_TOKEN_AMOUNT = -1 // -1 indicates unlimited

async function claimAiTokensFromPurchase(payment: any) {
  console.log("payment", payment)

  // Check if the user exists based on the payment email
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, payment.receipt_email))
    .execute()

  if (user.length === 0) return

  const userId = user[0].id
  console.log("userId", userId)

  if (!userId) return

  // Get the tier from the payment or product
  const tier = payment.metadata?.tier || "supporter"
  const productId =
    payment.productId || payment.metadata?.productId || "supporter_tier"

  const aitoken = await db
    .select()
    .from(aitokenTable)
    .where(eq(aitokenTable.userId, userId))
    .execute()

  if (tier === "ultra") {
    // Ultra tier gets unlimited tokens
    if (aitoken.length > 0) {
      await db
        .update(aitokenTable)
        .set({
          numTokens: -1, // Unlimited
          tier: "ultra",
          type: "paid",
        } as any)
        .where(eq(aitokenTable.userId, userId))
    } else {
      await db.insert(aitokenTable).values({
        userId: userId,
        numTokens: -1, // Unlimited
        tier: "ultra",
        type: "paid",
      } as any)
    }
  } else if (tier === "pro") {
    // Pro tier gets 200 tokens
    if (aitoken.length > 0) {
      await db
        .update(aitokenTable)
        .set({
          numTokens: PRO_TIER_TOKEN_AMOUNT,
          tier: "pro",
          type: "paid",
        } as any)
        .where(eq(aitokenTable.userId, userId))
    } else {
      await db.insert(aitokenTable).values({
        userId: userId,
        numTokens: PRO_TIER_TOKEN_AMOUNT,
        tier: "pro",
        type: "paid",
      } as any)
    }
  } else {
    // Legacy supporter tier
    if (aitoken.length > 0) {
      const aiToken = aitoken[0] as any
      await db
        .update(aitokenTable)
        .set({
          numTokens: aiToken.numTokens + SUPPORT_TIER_TOKEN_AMOUNT,
          tier: "pro", // Upgrade legacy supporters to pro
        } as any)
        .where(eq(aitokenTable.userId, userId))
    } else {
      await db.insert(aitokenTable).values({
        userId: userId,
        numTokens: BASE_TIER_TOKEN_AMOUNT + SUPPORT_TIER_TOKEN_AMOUNT,
        tier: "pro",
      } as any)
    }
  }
}

export async function isUserSupporterByEmail(email: string) {
  if (!email) return false

  const latestPurchaseFromUser = await db
    .select()
    .from(purchasesTable)
    .where(eq(purchasesTable.email, email))
    .orderBy(desc(purchasesTable.createdAt))
    .limit(1)
    .execute()
    .then((rows) => rows[0])

  if (!latestPurchaseFromUser) return false

  //if the user has a purchase that is not expired (created at is less than a month ago)
  if (
    latestPurchaseFromUser &&
    //&& latestPurchaseFromUser.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    latestPurchaseFromUser.status === "succeeded"
  )
    return true

  return false
}

export async function getUserTier(
  email: string
): Promise<"free" | "pro" | "ultra"> {
  if (!email) return "free"

  const latestPurchaseFromUser = await db
    .select()
    .from(purchasesTable)
    .where(eq(purchasesTable.email, email))
    .orderBy(desc(purchasesTable.createdAt))
    .limit(1)
    .execute()
    .then((rows) => rows[0])

  if (
    !latestPurchaseFromUser ||
    latestPurchaseFromUser.status !== "succeeded"
  ) {
    return "free"
  }

  const tier = latestPurchaseFromUser.tier as string
  if (tier === "ultra") return "ultra"
  if (tier === "pro") return "pro"
  return "free"
}

export async function isUserUltraTier(email: string): Promise<boolean> {
  return (await getUserTier(email)) === "ultra"
}

export async function isUserProTier(email: string): Promise<boolean> {
  const tier = await getUserTier(email)
  return tier === "pro" || tier === "ultra"
}

export async function isUserSupporterById(id: string) {
  const user = await getUserById(id)
  
  // If user exists in local DB, use their email
  if (user?.email) {
    return isUserSupporterByEmail(user.email)
  }
  
  // If user doesn't exist in local DB, try to get email from Clerk
  const { currentUser } = await import("@clerk/nextjs/server")
  const clerkUser = await currentUser()
  
  // If the ID matches the current Clerk user, use their email
  if (clerkUser?.id === id && clerkUser.emailAddresses?.[0]?.emailAddress) {
    return isUserSupporterByEmail(clerkUser.emailAddresses[0].emailAddress)
  }
  
  // Default to false if we can't find the user
  return false
}

export async function getUserTierById(
  id: string
): Promise<"free" | "pro" | "ultra"> {
  const user = await getUserById(id)
  
  // If user exists in local DB, use their email
  if (user?.email) {
    return getUserTier(user.email)
  }
  
  // If user doesn't exist in local DB, try to get email from Clerk
  // This handles the case where users exist in Clerk but not in local DB
  const { currentUser } = await import("@clerk/nextjs/server")
  const clerkUser = await currentUser()
  
  // If the ID matches the current Clerk user, use their email
  if (clerkUser?.id === id && clerkUser.emailAddresses?.[0]?.emailAddress) {
    return getUserTier(clerkUser.emailAddresses[0].emailAddress)
  }
  
  // Default to free tier if we can't find the user
  return "free"
}

export async function isUserUltraTierById(id: string): Promise<boolean> {
  return (await getUserTierById(id)) === "ultra"
}

export async function isUserProTierById(id: string): Promise<boolean> {
  const tier = await getUserTierById(id)
  return tier === "pro" || tier === "ultra"
}
