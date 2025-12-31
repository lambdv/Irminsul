import { NextRequest, NextResponse } from "next/server"
import { isUserSupporterByEmail } from "@/app/(main)/support/actions"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const isSupporter = await isUserSupporterByEmail(email)

    return NextResponse.json({ isSupporter })
  } catch (error) {
    console.error("Error checking supporter status:", error)
    return NextResponse.json(
      { error: "Failed to check supporter status" },
      { status: 500 }
    )
  }
}
