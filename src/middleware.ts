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

const SECURITY_HEADERS = {
  "X-DNS-Prefetch-Control": "off",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://clerk.irminsul.moe https://static.cloudflareinsights.com https://*.hcaptcha.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: discord.com discordapp.com;",
  "X-Permitted-Cross-Domain-Policies": "none",
  "Cross-Origin-Embedder-Policy": "unsafe-none",
  "Cross-Origin-Opener-Policy": "unsafe-none",
  "Cross-Origin-Resource-Policy": "cross-origin",
}

function isSuspiciousRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get("user-agent") || ""
  const suspiciousUserAgents = ["curl", "wget", "python-requests"]

  if (suspiciousUserAgents.some((ua) => userAgent.toLowerCase().includes(ua))) {
    return true
  }

  if (Array.from(request.headers.keys()).length > 200) {
    return true
  }

  const method = request.method
  if (
    !["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"].includes(
      method
    )
  ) {
    return true
  }

  return false
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }
  return response
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const pathname = request.nextUrl.pathname

  // Skip Next.js internal routes
  if (pathname.startsWith("/_next")) {
    return NextResponse.next()
  }

  // Skip static files (files with extensions like .css, .js, .png, etc.)
  if (/\.\w+$/.test(pathname)) {
    return NextResponse.next()
  }

  // Block suspicious requests
  if (isSuspiciousRequest(request)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  // Handle redirects for old routes
  if (pathname === "/characters/") {
    return NextResponse.redirect(
      new URL("/archive/characters/" + pathname.split("/")[2], request.url)
    )
  }
  if (pathname === "/weapons/") {
    return NextResponse.redirect(
      new URL("/archive/weapons/" + pathname.split("/")[2], request.url)
    )
  }
  if (pathname === "/artifacts/") {
    return NextResponse.redirect(
      new URL("/archive/artifacts/" + pathname.split("/")[2], request.url)
    )
  }

  // Protect routes that are not public
  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  const response = NextResponse.next()
  return addSecurityHeaders(response)
})

export const config = {
  matcher: ["/((?!_next|.*\\..*|favicon).*)", "/api/:path*", "/admin/:path*"],
}
