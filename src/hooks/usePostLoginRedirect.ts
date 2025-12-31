"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function usePostLoginRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [redirectPending, setRedirectPending] = useState(false)

  useEffect(() => {
    // Check if there's a selected plan in localStorage
    const selectedPlan = localStorage.getItem("selectedPlan")

    if (selectedPlan && !redirectPending) {
      try {
        const { priceId, tier } = JSON.parse(selectedPlan)
        setRedirectPending(true)

        // Clear the stored plan
        localStorage.removeItem("selectedPlan")

        // Trigger checkout
        triggerCheckout(priceId, tier)
      } catch (error) {
        console.error("Error parsing selected plan:", error)
      }
    }
  }, [redirectPending])

  const triggerCheckout = async (priceId: string, tier: string) => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          tier,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.details ||
            errorData.error ||
            "Failed to create checkout session"
        )
      }

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error) {
      console.error("Post-login checkout error:", error)
      alert(
        `Checkout error: ${error instanceof Error ? error.message : "Unknown error"}`
      )
      setRedirectPending(false)
    }
  }

  const setSelectedPlan = (priceId: string, tier: string) => {
    localStorage.setItem("selectedPlan", JSON.stringify({ priceId, tier }))
  }

  return { setSelectedPlan, redirectPending }
}
