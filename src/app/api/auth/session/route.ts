import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(null)
    }
    
    // Return session object compatible with NextAuth format
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || null,
        name: user.fullName || user.firstName || null,
        image: user.imageUrl || null,
      },
    })
  } catch (error) {
    console.error("Session API error:", error)
    return NextResponse.json(null)
  }
}
