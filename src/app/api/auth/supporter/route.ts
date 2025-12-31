import { NextRequest, NextResponse } from "next/server"
import { isUserSupporterByEmail } from "@/app/(main)/support/actions"
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
      return NextResponse.json({ isSupporter: false }, { status: 400 })
    }

    email = email.toLowerCase().trim()

    if (email.length > 254 || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json({ isSupporter: false }, { status: 400 })
    }

    const isSupporter = await isUserSupporterByEmail(email)

    return NextResponse.json({ isSupporter })
  } catch (error) {
    console.error("Error checking supporter status:", error)
    return NextResponse.json({ isSupporter: false }, { status: 500 })
  }
}
