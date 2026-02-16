import React from "react"
import { getServerUser } from "@/lib/server-session"
import PricingTiers from "./PricingTiers"

export async function generateMetadata() {
  return {
    title: "Pricing | Irminsul",
  }
}

export default async function page() {
  const user = await getServerUser()

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <PricingTiers user={user} />
    </div>
  )
}
