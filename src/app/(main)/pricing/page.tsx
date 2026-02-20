import React from "react"
import { getServerUser } from "@/lib/server-session"
import PricingTiers from "./PricingTiers"
import { PRO_TIER_ID, ULTRA_TIER_ID } from "@/lib/pricing/tiers"

export async function generateMetadata() {
  return {
    title: "Pricing | Irminsul",
  }
}

export default async function page() {
  const user = await getServerUser()

  return (
    <div className="min-h-screen overflow-y-auto">
      <PricingTiers
        user={user}
        proProductId={PRO_TIER_ID}
        ultraProductId={ULTRA_TIER_ID}
      />
    </div>
  )
}
