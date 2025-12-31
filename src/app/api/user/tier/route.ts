import { NextRequest, NextResponse } from "next/server"
import { getServerUser } from "@/lib/server-session"
import { getUserTierById } from "@/app/(main)/pricing/actions"

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json({ tier: "free" }, { status: 200 })
    }

    const tier = await getUserTierById(user.id)

    return NextResponse.json({ tier }, { status: 200 })
  } catch (error) {
    console.error("Error fetching user tier:", error)
    return NextResponse.json({ tier: "free" }, { status: 500 })
  }
}
