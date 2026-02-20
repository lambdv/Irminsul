"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/cn/card"
import { Button } from "@/components/cn/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/shadcn/utils"

type BillingCycle = "monthly" | "yearly"

interface SupportPageProps {
  user: any
}

// Stripe payment links - monthly and yearly
const STRIPE_LINKS = {
  pro: {
    monthly: "https://buy.stripe.com/4gMbJ17lWeOC1fh61vawo08",
    yearly: "https://buy.stripe.com/6oU28ray8bCq4rtey1awo0b",
  },
  ultra: {
    monthly: "https://buy.stripe.com/4gMbJ17lW5e2gabfC5awo07",
    yearly: "https://buy.stripe.com/cNi28r9u4aym0bd75zawo09",
  },
}

// Hardcoded pricing display - matching Stripe dashboard
const PRICING = {
  pro: {
    monthly: { display: "$20", amount: 20 },
    yearly: { display: "$192", amount: 192 },
  },
  ultra: {
    monthly: { display: "$60", amount: 60 },
    yearly: { display: "$576", amount: 576 },
  },
}

// Helper function to get effective monthly price
const getEffectivePrice = (
  tier: "pro" | "ultra",
  billingCycle: BillingCycle
) => {
  const price = PRICING[tier][billingCycle]
  if (billingCycle === "yearly") {
    // Show effective monthly price for yearly (divide by 12)
    const monthlyEquivalent = Math.round(price.amount / 12)
    return `$${monthlyEquivalent}`
  }
  return price.display
}

export default function SupportPage({ user }: SupportPageProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly")

  const getProLink = () => {
    const baseLink = STRIPE_LINKS.pro[billingCycle]
    return user
      ? `${baseLink}?prefilled_email=${encodeURIComponent(user.email)}`
      : "/login"
  }

  const getUltraLink = () => {
    const baseLink = STRIPE_LINKS.ultra[billingCycle]
    return user
      ? `${baseLink}?prefilled_email=${encodeURIComponent(user.email)}`
      : "/login"
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Upgrade to Pro</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Unlock premium features and support the development of Irminsul.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="mt-6 flex justify-center">
          <div className="bg-muted/50 p-1.5 rounded-2xl flex items-center border border-border inline-flex">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
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
                "px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                billingCycle === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Yearly
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* F2P Tier */}
        <Card>
          <CardHeader>
            <CardTitle>F2P</CardTitle>
            <div className="text-2xl font-bold">Free</div>
            <CardDescription>Full access to Irminsul</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  Access to data, articles and tools
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">20 prompts until refresh</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-muted text-muted-foreground cursor-not-allowed"
              disabled
            >
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Tier */}
        <Card className="border-primary">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Pro</CardTitle>
              <span className="text-primary text-xs font-bold">
                Recommended
              </span>
            </div>
            <div className="text-2xl font-bold">
              {getEffectivePrice("pro", billingCycle)}
            </div>
            <CardDescription>Enhanced experience</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Everything in Free tier</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Ad-Free experience</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Extended usage limits</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Verified badge on your profile</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  Early access to new preview features
                </span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              asChild
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href={getProLink()}>Upgrade</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Ultra Tier */}
        <Card>
          <CardHeader>
            <CardTitle>Ultra</CardTitle>
            <div className="text-2xl font-bold">
              {getEffectivePrice("ultra", billingCycle)}
            </div>
            <CardDescription>Ultimate support</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Everything in Pro tier</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Priority support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  Unlimited prompts with highest rate limits
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  Direct communication with developers
                </span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              asChild
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href={getUltraLink()}>Upgrade</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
