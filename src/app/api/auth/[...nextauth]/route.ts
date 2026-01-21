import { NextResponse } from "next/server"

// Clerk handles authentication routes automatically
// This route exists only for Next.js type checking compatibility
// All auth requests are handled by Clerk middleware

export async function GET() {
  return NextResponse.json(
    { error: "Auth routes are handled by Clerk" },
    { status: 404 }
  )
}

export async function POST() {
  return NextResponse.json(
    { error: "Auth routes are handled by Clerk" },
    { status: 404 }
  )
}
