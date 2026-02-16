"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/cn/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/cn/card"
import { cn } from "@/lib/shadcn/utils"

export default function PricingTiers({ user }: { user: any }) {
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  )

  const plans = [
    {
      name: "F2P",
      price: "Free",
      description: "Full access to Irminsul",
      features: [
        "Access to data, articles and tools",
        "20 prompts until refresh",
      ],
      buttonText: "Current Plan",
      buttonHref: "#",
      featured: false,
      disabled: true,
    },
    {
      name: "Pro",
      price: billingCycle === "monthly" ? "$20" : "$16",
      description: "Enhanced experience",
      features: [
        "Everything in Free tier",
        "Ad-Free experience",
        "Extended usage limits",
        "Verified badge on your profile",
        "Early access to new preview features",
      ],
      buttonText: "Upgrade",
      buttonHref: user
        ? "https://buy.stripe.com/YOUR_PRO_LINK?prefilled_email=" + user.email
        : "/login",
      featured: true,
      badge: "Recommended",
    },
    {
      name: "Ultra",
      price: billingCycle === "monthly" ? "$100" : "$80",
      description: "Ultimate support",
      features: [
        "Everything in Pro tier",
        "Priority support",
        "Unlimited prompts with highest rate limits",
        "Direct communication with developers",
      ],
      buttonText: "Upgrade",
      buttonHref: user
        ? "https://buy.stripe.com/YOUR_ULTRA_LINK?prefilled_email=" + user.email
        : "/login",
      featured: false,
    },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 bg-transparent text-white selection:bg-orange-500/30 flex-grow flex flex-col justify-center overflow-hidden">
      <div className="flex flex-col items-center text-center mb-10 shrink-0">
        <h1 className="text-6xl font-semibold mb-8 tracking-tighter text-foreground">
          Pricing
        </h1>
        <div className="bg-muted/50 p-1.5 rounded-2xl flex items-center border border-border">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "px-8 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
              billingCycle === "monthly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={cn(
              "px-8 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
              billingCycle === "yearly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full shrink-0">
        <h2 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-widest opacity-80">
          Individual Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "bg-card/50 border-border flex flex-col justify-between h-full transition-all duration-300",
                plan.featured && "border-primary/50"
              )}
            >
              <div className="flex flex-col h-full">
                <CardHeader className="space-y-1 pt-8 px-7">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                      {plan.name}
                    </CardTitle>
                    {plan.badge && (
                      <span className="text-primary text-xs font-bold tracking-tight">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col pt-1">
                    <span className="text-3xl font-bold text-foreground tracking-tight">
                      {plan.price === "Free" ? "Free" : `${plan.price}/mo.`}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="px-7 py-4 flex-grow">
                  <p className="text-sm text-muted-foreground mb-6 font-medium">
                    {plan.description}
                  </p>
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0 stroke-[2.5]" />
                        <span className="text-[13px] text-foreground/90 leading-tight font-medium">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-7 pt-2 pb-8">
                  <Button
                    asChild={!plan.disabled}
                    disabled={plan.disabled}
                    className={cn(
                      "w-full rounded-xl py-6 text-sm font-bold transition-all duration-200",
                      plan.featured
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
                    )}
                  >
                    {plan.disabled ? (
                      plan.buttonText
                    ) : (
                      <Link href={plan.buttonHref}>{plan.buttonText}</Link>
                    )}
                  </Button>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
