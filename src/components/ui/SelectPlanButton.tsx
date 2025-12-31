"use client"

import { Button } from "@/components/cn/button"
import Link from "next/link"

interface SelectPlanButtonProps {
  priceId: string
  tier: string
  className?: string
  variant?: "default" | "outline"
}

export default function SelectPlanButton({
  priceId,
  tier,
  className = "",
  variant = "outline",
}: SelectPlanButtonProps) {
  const handleClick = () => {
    // Store selected plan for post-login checkout
    localStorage.setItem("selectedPlan", JSON.stringify({ priceId, tier }))
    window.location.href = "/login"
  }

  return (
    <Button className={`${className} btn-${variant}`} onClick={handleClick}>
      Select
    </Button>
  )
}
