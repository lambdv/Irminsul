import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getServerSession, getServerUser } from "@/lib/server-session"

export async function POST(request: NextRequest) {
  try {
    console.log("Checkout API called")

    const session = await getServerSession()
    const user = await getServerUser()

    console.log("Session:", session)
    console.log("User:", user)

    if (!user?.email) {
      console.log("No session or user email found")
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      )
    }

    const { priceId, tier } = await request.json()

    console.log("Request data:", { priceId, tier })

    if (!priceId || !tier) {
      console.log("Missing required data")
      return NextResponse.json(
        { error: "Missing priceId or tier" },
        { status: 400 }
      )
    }

    console.log("Creating Stripe checkout session...")

    let lineItems

    // Handle both price IDs and product IDs
    if (priceId.startsWith("prod_")) {
      // This is a product ID, need to find its default price
      try {
        const prices = await stripe.prices.list({
          product: priceId,
          active: true,
          limit: 1,
        })

        if (prices.data.length === 0) {
          throw new Error(`No active prices found for product ${priceId}`)
        }

        lineItems = [
          {
            price: prices.data[0].id,
            quantity: 1,
          },
        ]
      } catch (error) {
        console.error("Error fetching product price:", error)
        throw new Error(`Invalid product ID: ${priceId}`)
      }
    } else {
      // This is already a price ID
      lineItems = [
        {
          price: priceId,
          quantity: 1,
        },
      ]
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: user.email,
      billing_address_collection: "required",
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"}/pricing?canceled=true`,
      metadata: {
        tier: tier,
        userId: user.id,
        priceId: priceId, // Store original ID for reference
      },
    })

    console.log("Checkout session created:", checkoutSession.url)

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    console.error("Error details:", JSON.stringify(error, null, 2))
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
