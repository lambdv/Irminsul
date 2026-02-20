import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getServerUser } from "@/lib/server-session"
import { TIER_PRODUCT_IDS } from "@/lib/pricing/tiers"

type BillingCycle = "monthly" | "yearly"

const INTERVAL_BY_CYCLE: Record<BillingCycle, "month" | "year"> = {
  monthly: "month",
  yearly: "year",
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()

    if (!user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { productId, priceType, billingCycle = "monthly" } =
      await request.json()

    const allowedProductIds = Object.values(TIER_PRODUCT_IDS)

    if (!productId || !allowedProductIds.includes(productId)) {
      return NextResponse.json(
        { error: "Valid product ID is required" },
        { status: 400 }
      )
    }

    if (!["monthly", "yearly"].includes(billingCycle)) {
      return NextResponse.json(
        { error: "Valid billing cycle is required" },
        { status: 400 }
      )
    }

    const prices = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 100,
    })

    const interval = INTERVAL_BY_CYCLE[billingCycle as BillingCycle]

    const selectedPrice = prices.data.find(
      (price) =>
        price.type === "recurring" && price.recurring?.interval === interval
    )

    if (!selectedPrice) {
      return NextResponse.json(
        { error: "No active price found for selected billing cycle" },
        { status: 400 }
      )
    }

    const domain = process.env.NEXT_PUBLIC_APP_URL || "https://irminsul.moe"

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price: selectedPrice.id,
          quantity: 1,
        },
      ],
      success_url: `${domain}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        priceType,
        productId,
        billingCycle,
      },
    })

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
