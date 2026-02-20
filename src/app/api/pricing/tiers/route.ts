import { NextResponse } from "next/server"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { TIER_PRODUCT_IDS, type TierKey } from "@/lib/pricing/tiers"

type BillingCycle = "monthly" | "yearly"

const INTERVAL_BY_CYCLE: Record<BillingCycle, "month" | "year"> = {
  monthly: "month",
  yearly: "year",
}

function formatPrice(unitAmount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: unitAmount % 100 === 0 ? 0 : 2,
  }).format(unitAmount / 100)
}

function pickPriceByCycle(
  prices: Stripe.Price[],
  cycle: BillingCycle
): Stripe.Price | null {
  const interval = INTERVAL_BY_CYCLE[cycle]
  return (
    prices.find((price) => price.type === "recurring" && price.recurring?.interval === interval) ||
    null
  )
}

async function getTierPricing(productId: string) {
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  })

  const monthlyPrice = pickPriceByCycle(prices.data, "monthly")
  const yearlyPrice = pickPriceByCycle(prices.data, "yearly")

  const toPricePayload = (price: Stripe.Price | null) => {
    if (!price || price.unit_amount === null) return null

    return {
      priceId: price.id,
      amount: price.unit_amount,
      currency: price.currency,
      display: formatPrice(price.unit_amount, price.currency),
    }
  }

  return {
    monthly: toPricePayload(monthlyPrice),
    yearly: toPricePayload(yearlyPrice),
  }
}

export async function GET() {
  try {
    const entries = await Promise.all(
      (Object.keys(TIER_PRODUCT_IDS) as TierKey[]).map(async (tier) => {
        const productId = TIER_PRODUCT_IDS[tier]

        try {
          const pricing = await getTierPricing(productId)
          return [
            tier,
            {
              productId,
              ...pricing,
            },
          ] as const
        } catch (error) {
          console.warn(
            `Pricing unavailable for tier "${tier}" with product "${productId}"`,
            error
          )

          return [
            tier,
            {
              productId,
              monthly: null,
              yearly: null,
            },
          ] as const
        }
      })
    )

    return NextResponse.json(Object.fromEntries(entries))
  } catch (error) {
    console.error("Error fetching pricing tiers:", error)
    return NextResponse.json(
      { error: "Failed to load pricing tiers" },
      { status: 500 }
    )
  }
}
