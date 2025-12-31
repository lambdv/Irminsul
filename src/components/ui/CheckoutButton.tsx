"use client"

import { useState } from "react"
import { Button } from "@/components/cn/button"
import { Loader2 } from "lucide-react"

interface CheckoutButtonProps {
  priceId: string
  tier: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export default function CheckoutButton({
  priceId,
  tier,
  children,
  className,
  disabled = false,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)

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
        console.error("API Error:", errorData)
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
      console.error("Checkout error:", error)
      // You could add a toast notification here
      alert(
        `Checkout error: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      className={className}
      onClick={handleCheckout}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  )
}
