"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/cn/card"
import { Button } from "@/components/cn/button"
import Advertisment from "@/components/ui/Advertisment"

export default function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [params, setParams] = useState<{
    [key: string]: string | string[] | undefined
  }>({})
  const [user, setUser] = useState<any>(null)
  const [isSupporter, setIsSupporter] = useState(false)

  useEffect(() => {
    const fetchParams = async () => {
      const p = await searchParams
      setParams(p)
    }
    fetchParams()

    // Fetch user session and supporter status
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.user) {
          setUser(data.user)
          // Check supporter status
          return fetch("/api/support/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: data.user.email }),
          })
        }
        return null
      })
      .then((res) => {
        if (res) {
          return res.json()
        }
        return null
      })
      .then((data) => {
        if (data) {
          setIsSupporter(data.isSupporter || false)
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error)
      })
  }, [searchParams])

  // Handle checkout success/cancellation
  useEffect(() => {
    if (params?.success === "true") {
      console.log("Checkout successful!")
    }
    if (params?.canceled === "true") {
      console.log("Checkout canceled")
    }
  }, [params])

  // Handle post-login checkout
  useEffect(() => {
    const selectedPlan = localStorage.getItem("selectedPlan")

    if (selectedPlan && user && !isSupporter) {
      try {
        const { priceId, tier } = JSON.parse(selectedPlan)
        localStorage.removeItem("selectedPlan")

        // Trigger checkout after a short delay
        setTimeout(() => {
          triggerCheckout(priceId, tier)
        }, 500)
      } catch (error) {
        console.error("Error parsing selected plan:", error)
      }
    }
  }, [user, isSupporter])

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
    }
  }

  return (
    <div className="container mx-auto px-4">
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Upgrade to Pro</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Unlock premium features and support development of Irminsul.
          </p>
        </div>
        <Advertisment type="banner" className="mb-8 max-w-5xl mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free Tier */}
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
                  <span className="text-sm">
                    20 SeelieAI tokens until refresh
                  </span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {user && !isSupporter ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button asChild className="w-full" variant="outline">
                  <Link href="/login">Select</Link>
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Pro Tier */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <div className="text-2xl font-bold">$20</div>
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
                  <span className="text-sm">200 SeelieAI tokens</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    Verified badge on your profile
                  </span>
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
              {user && isSupporter ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : user && !isSupporter ? (
                <Button asChild className="w-full">
                  <Link
                    href={`https://buy.stripe.com/5kQ8wPbCc5e2gabfC5awo03?prefilled_email=${user?.email}`}
                  >
                    Upgrade
                  </Link>
                </Button>
              ) : (
                <Button asChild className="w-full">
                  <Link href="https://buy.stripe.com/5kQ8wPbCc5e2gabfC5awo03">
                    Upgrade
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Ultra Tier */}
          <Card>
            <CardHeader>
              <CardTitle>Ultra</CardTitle>
              <div className="text-2xl font-bold">$200</div>
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
                    Unlimited SeelieAI tokens + Pro models and early access
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
              {user && isSupporter ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : user && !isSupporter ? (
                <Button asChild className="w-full">
                  <Link
                    href={`https://buy.stripe.com/cNi00jcGg21Qf67ahLawo04?prefilled_email=${user?.email}`}
                  >
                    Upgrade
                  </Link>
                </Button>
              ) : (
                <Button asChild className="w-full">
                  <Link href="https://buy.stripe.com/cNi00jcGg21Qf67ahLawo04">
                    Upgrade
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
        <Advertisment type="banner" className="mt-12 max-w-5xl mx-auto" />
      </div>
    </div>
  )
}
