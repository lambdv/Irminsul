import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/login(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/pricing(.*)",
  "/auth(.*)",
  "/api/auth(.*)",
  "/api/webhooks(.*)",
  "/api/stripe/webhook(.*)",
  "/",
  "/archive(.*)",
  "/characters(.*)",
  "/weapons(.*)",
  "/artifacts(.*)",
])

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const pathname = request.nextUrl.pathname

  // Skip Next.js internal routes
  if (pathname.startsWith("/_next")) {
    return NextResponse.next()
  }

  // Skip protection for API routes (they handle auth themselves)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Skip static files (files with extensions like .css, .js, .png, etc.)
  if (/\.\w+$/.test(pathname)) {
    return NextResponse.next()
  }

  // Clerk handles its own authentication routes automatically
  // No need to explicitly allow them - Clerk middleware handles this

  // Protect routes that are not public
  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Only match routes that don't start with:
     * - _next (Next.js internal)
     * - api (API routes)
     * - Static files (have file extensions)
     */
    "/((?!_next|api|.*\\..*|favicon).*)",
  ],
}
