import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // Clerk handles logout client-side via useClerk().signOut()
  // This route is kept for backward compatibility
  // Redirect to home - actual logout should be handled client-side
  return NextResponse.redirect(new URL("/", request.url));
}