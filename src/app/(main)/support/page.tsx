import { redirect } from "next/navigation"
import React from "react"
import { getUser, getUserById, isAdmin } from "@/app/(auth)/actions"
import { stripe } from "@/lib/stripe"
import { syncStripePayments } from "./actions"
import Link from "next/link"
import DonationGoal from "./goal"
import { eq } from "drizzle-orm"
import db from "@/db/db"
import { purchasesTable } from "@/db/schema/purchase"
import {
  BASE_TIER_TOKEN_AMOUNT,
  SUPPORT_TIER_TOKEN_AMOUNT,
  isUserSupporterById,
} from "./actions"
import {
  getServerSession,
  getServerUser,
  getServerSupporterStatus,
} from "@/lib/server-session"
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
import CheckoutButton from "@/components/ui/CheckoutButton"

export async function generateMetadata({ params }) {
  return {
    title: "Pricing | Irminsul",
  }
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const session = await getServerSession()
  const user = await getServerUser()
  const isSupporter = user ? await getServerSupporterStatus() : false

  // Handle checkout success/cancellation
  if (params?.success === "true") {
    // You could sync payments here or show a success message
    console.log("Checkout successful!")
  }

  if (params?.canceled === "true") {
    console.log("Checkout canceled")
  }

  //const payments = await stripe.paymentIntents.list()

  const payments = await db
    .select()
    .from(purchasesTable)
    .where(eq(purchasesTable.status, "succeeded"))
  // await syncStripePayments()

  return (
    <div className="container mx-auto px-4">
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Upgrade to Pro</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Unlock premium features and support the development of Irminsul.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
                    {BASE_TIER_TOKEN_AMOUNT} SeelieAI tokens until refresh
                  </span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {user && !isSupporter ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : user && isSupporter ? (
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/login">Login Required</Link>
                </Button>
              ) : (
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/login">Login to Access</Link>
                </Button>
              )}
            </CardFooter>
          </Card>

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
                  <span className="text-sm">
                    {SUPPORT_TIER_TOKEN_AMOUNT} SeelieAI tokens
                  </span>
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
                <CheckoutButton
                  priceId="price_1Qv5HxHW0Mh0wiaabvRVdIBP"
                  tier="pro"
                  className="w-full"
                >
                  Upgrade
                </CheckoutButton>
              ) : (
                <Button asChild className="w-full">
                  <Link href="/login">Login to Upgrade</Link>
                </Button>
              )}
            </CardFooter>
          </Card>

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
                <Button className="w-full" variant="outline">
                  Upgrade from Pro
                </Button>
              ) : user && !isSupporter ? (
                <CheckoutButton
                  priceId="prod_ThfLCVbRYRbJ5V" // Ultra tier product ID
                  tier="ultra"
                  className="w-full"
                >
                  Upgrade
                </CheckoutButton>
              ) : (
                <Button asChild className="w-full">
                  <Link href="/login">Login to Upgrade</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* <DonationGoal goalAmount={40} payments={payments}/> */}
    </div>
  )
}
