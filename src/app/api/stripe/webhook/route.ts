import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import db from "@/db/db"
import { purchasesTable } from "@/db/schema/purchase"
import { usersTable } from "@/db/schema/user"
import { aitokenTable } from "@/db/schema/aitoken"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import {
  BASE_TIER_TOKEN_AMOUNT,
  SUPPORT_TIER_TOKEN_AMOUNT,
  PRO_TIER_TOKEN_AMOUNT,
} from "@/app/(main)/pricing/actions"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: any

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  console.log("Webhook event type:", event.type)

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object
      await handleCompletedCheckout(session)
      break

    case "payment_intent.succeeded":
      const paymentIntent = event.data.object
      await handleSuccessfulPayment(paymentIntent)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleCompletedCheckout(session: any) {
  console.log("Handling completed checkout:", session.id)

  const userEmail = session.customer_email || session.customer_details?.email
  const tier = session.metadata?.tier
  const userId = session.metadata?.userId

  if (!userEmail) {
    console.error("No email found in checkout session")
    return
  }

  try {
    // Check if user exists
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, userEmail))
      .limit(1)

    if (user.length === 0) {
      console.error("User not found for email:", userEmail)
      return
    }

    const actualUserId = user[0].id

    // Create purchase record
    await db.insert(purchasesTable).values({
      id: nanoid(),
      stripePaymentId: session.payment_intent || session.id,
      email: userEmail,
      amount: session.amount_total || 0,
      status: "succeeded",
      createdAt: new Date(session.created * 1000),
      productId: session.metadata?.priceId || `tier_${tier}`,
      productName: `${tier?.charAt(0).toUpperCase() + tier?.slice(1)} Tier`,
      tier: tier || "supporter",
    } as any)

    // Update AI tokens based on tier
    await updateAiTokensForTier(actualUserId, tier || "supporter")

    console.log(
      `Successfully processed ${tier} purchase for user ${actualUserId}`
    )
  } catch (error) {
    console.error("Error processing completed checkout:", error)
  }
}

async function handleSuccessfulPayment(paymentIntent: any) {
  console.log("Handling successful payment:", paymentIntent.id)
  // This is handled by the completed checkout, but we keep it for backup
}

async function updateAiTokensForTier(userId: string, tier: string) {
  const existingToken = await db
    .select()
    .from(aitokenTable)
    .where(eq(aitokenTable.userId, userId))
    .limit(1)

  try {
    switch (tier) {
      case "ultra":
        // Ultra tier gets unlimited tokens
        if (existingToken.length > 0) {
          await db
            .update(aitokenTable)
            .set({
              numTokens: -1, // -1 indicates unlimited
              tier: "ultra",
              type: "paid",
            } as any)
            .where(eq(aitokenTable.userId, userId))
        } else {
          await db.insert(aitokenTable).values({
            id: nanoid(),
            userId: userId,
            ipAddress: "0.0.0.0", // Placeholder for paid users
            numTokens: -1,
            type: "paid",
            tier: "ultra",
          } as any)
        }
        break

      case "pro":
        // Pro tier gets 200 tokens
        if (existingToken.length > 0) {
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
            id: nanoid(),
            userId: userId,
            ipAddress: "0.0.0.0", // Placeholder for paid users
            numTokens: PRO_TIER_TOKEN_AMOUNT,
            type: "paid",
            tier: "pro",
          } as any)
        }
        break

      default:
        // Legacy supporter tier
        const tokenAmount = BASE_TIER_TOKEN_AMOUNT + SUPPORT_TIER_TOKEN_AMOUNT
        if (existingToken.length > 0) {
          await db
            .update(aitokenTable)
            .set({
              numTokens: existingToken[0].numTokens + SUPPORT_TIER_TOKEN_AMOUNT,
              tier: "pro", // Upgrade legacy supporters to pro
              type: "paid",
            } as any)
            .where(eq(aitokenTable.userId, userId))
        } else {
          await db.insert(aitokenTable).values({
            id: nanoid(),
            userId: userId,
            ipAddress: "0.0.0.0", // Placeholder for paid users
            numTokens: tokenAmount,
            type: "paid",
            tier: "pro",
          } as any)
        }
        break
    }

    console.log(`Updated AI tokens for user ${userId} with tier ${tier}`)
  } catch (error) {
    console.error("Error updating AI tokens:", error)
    throw error
  }
}
