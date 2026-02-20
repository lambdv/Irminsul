import { NextRequest, NextResponse } from "next/server"
import { getUserTierByEmail } from "@/app/(main)/support/actions"
import { rateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  const rateLimitResponse = rateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { searchParams } = new URL(request.url)
    let email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ tier: "free" }, { status: 400 })
    }

    email = email.toLowerCase().trim()

    if (email.length > 254 || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json({ tier: "free" }, { status: 400 })
    }

    const tier = await getUserTierByEmail(email)

    return NextResponse.json({ tier })
  } catch (error) {
    console.error("Error checking user tier:", error)
    return NextResponse.json({ tier: "free" }, { status: 500 })
  }
}
