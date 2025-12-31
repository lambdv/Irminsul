"use client"

import { useEffect } from "react"

export function usePostLoginCheckout() {
  useEffect(() => {
    // Check if there's a selected plan in localStorage after login
    const selectedPlan = localStorage.getItem("selectedPlan")

    if (selectedPlan) {
      try {
        const { priceId, tier } = JSON.parse(selectedPlan)

        // Clear the stored plan
        localStorage.removeItem("selectedPlan")

        // Trigger checkout after a short delay to ensure page is loaded
        setTimeout(() => {
          triggerStripeCheckout(priceId, tier)
        }, 1000)
      } catch (error) {
        console.error("Error parsing selected plan:", error)
      }
    }
  }, [])

  const triggerStripeCheckout = async (priceId: string, tier: string) => {
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
    }
  }

  const storeSelectedPlan = (priceId: string, tier: string) => {
    localStorage.setItem("selectedPlan", JSON.stringify({ priceId, tier }))
  }

  return { storeSelectedPlan }
}
