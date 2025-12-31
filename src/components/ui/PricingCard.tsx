"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import CheckoutButton from "@/components/ui/CheckoutButton"

interface PricingCardProps {
  title: string
  price: string
  description: string
  features: string[]
  isPopular?: boolean
  priceId: string
  tier: string
  user: any
  isSupporter: boolean
}

export default function PricingCard({
  title,
  price,
  description,
  features,
  isPopular = false,
  priceId,
  tier,
  user,
  isSupporter,
}: PricingCardProps) {
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Check for stored plan after login
    const selectedPlan = localStorage.getItem("selectedPlan")
    if (selectedPlan && user && !isSupporter) {
      try {
        const { priceId: storedPriceId, tier: storedTier } =
          JSON.parse(selectedPlan)
        localStorage.removeItem("selectedPlan")

        // Auto-trigger checkout
        setTimeout(() => {
          const button = document.querySelector(
            `[data-checkout-tier="${storedTier}"]`
          ) as HTMLButtonElement
          if (button) button.click()
        }, 500)
      } catch (error) {
        console.error("Error parsing selected plan:", error)
      }
    }
  }, [user, isSupporter])

  const handleSelectPlan = (planPriceId: string, planTier: string) => {
    if (planTier === "free") {
      localStorage.setItem(
        "selectedPlan",
        JSON.stringify({ priceId: "", tier: "free" })
      )
      window.location.href = "/login"
    } else {
      localStorage.setItem(
        "selectedPlan",
        JSON.stringify({ priceId: planPriceId, tier: planTier })
      )
      window.location.href = "/login"
    }
  }

  const getButtonContent = () => {
    if (tier === "free") {
      if (user && !isSupporter) {
        return (
          <button className="w-full btn" disabled>
            Current Plan
          </button>
        )
      } else {
        return (
          <button
            className="w-full btn btn-outline"
            onClick={() => handleSelectPlan(priceId, tier)}
            disabled={isRedirecting}
          >
            Select
          </button>
        )
      }
    }

    // For Pro and Ultra tiers
    if (user && isSupporter) {
      return (
        <button className="w-full btn" disabled>
          Current Plan
        </button>
      )
    } else if (user && !isSupporter) {
      return (
        <CheckoutButton
          priceId={priceId}
          tier={tier}
          className="w-full"
          data-checkout-tier={tier}
        >
          Upgrade
        </CheckoutButton>
      )
    } else {
      return (
        <button
          className="w-full btn btn-outline"
          onClick={() => handleSelectPlan(priceId, tier)}
          disabled={isRedirecting}
        >
          {isRedirecting ? "Please wait..." : "Select"}
        </button>
      )
    }
  }

  return (
    <div className={`card ${isPopular ? "border-primary" : ""}`}>
      <div className="card-header">
        <div className="card-title">{title}</div>
        <div className="text-2xl font-bold">{price}</div>
        <div className="card-description">{description}</div>
      </div>
      <div className="card-content">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="card-footer">{getButtonContent()}</div>
    </div>
  )
}
