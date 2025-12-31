"use client"

import { usePostLoginRedirect } from "@/hooks/usePostLoginRedirect"
import { Button } from "@/components/cn/button"
import CheckoutButton from "@/components/ui/CheckoutButton"
import Link from "next/link"

interface PricingButtonProps {
  priceId: string
  tier: string
  user: any
  isSupporter: boolean
  variant?: "default" | "outline"
}

export default function PricingButton({
  priceId,
  tier,
  user,
  isSupporter,
  variant = "default",
}: PricingButtonProps) {
  const { setSelectedPlan, redirectPending } = usePostLoginRedirect()

  const handleSelectPlan = () => {
    setSelectedPlan(priceId, tier)
    window.location.href = "/login"
  }

  // Handle different button states
  if (tier === "free") {
    if (user && !isSupporter) {
      return (
        <Button className="w-full" disabled>
          Current Plan
        </Button>
      )
    } else {
      return (
        <Button className="w-full" variant="outline" asChild>
          <Link href="/login">Select</Link>
        </Button>
      )
    }
  }

  // For Pro and Ultra tiers
  if (user && isSupporter) {
    return (
      <Button className="w-full" disabled>
        Current Plan
      </Button>
    )
  } else if (user && !isSupporter) {
    return (
      <CheckoutButton
        priceId={priceId}
        tier={tier}
        className="w-full"
        disabled={redirectPending}
      >
        Upgrade
      </CheckoutButton>
    )
  } else {
    return (
      <Button
        className="w-full"
        variant="outline"
        onClick={handleSelectPlan}
        disabled={redirectPending}
      >
        {redirectPending ? "Processing..." : "Select"}
      </Button>
    )
  }
}
