import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getUserTierById } from "@/app/(main)/pricing/actions"

export async function GET(request: NextRequest) {
  try {
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ tier: "free" }, { status: 200 })
    }

    const tier = await getUserTierById(clerkUser.id)

    return NextResponse.json({ tier }, { status: 200 })
  } catch (error) {
    console.error("Error fetching user tier:", error)
    return NextResponse.json({ tier: "free" }, { status: 500 })
  }
}
