import { NextRequest, NextResponse } from "next/server"
import { rateLimit, getRateLimitConfig } from "@/lib/rate-limit"
import { isAdmin } from "@/app/(auth)/actions"

const SECURITY_HEADERS = {
  "X-DNS-Prefetch-Control": "off",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: discord.com discordapp.com;",
  "X-Permitted-Cross-Domain-Policies": "none",
  "Cross-Origin-Embedder-Policy": "unsafe-none",
  "Cross-Origin-Opener-Policy": "unsafe-none",
  "Cross-Origin-Resource-Policy": "cross-origin",
}

function isSuspiciousRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get("user-agent") || ""
  const suspiciousUserAgents = [
    "curl",
    "wget",
    "python-requests",
    // Removed: "bot", "spider", "crawler" - these can be legitimate browser extensions
  ]

  if (suspiciousUserAgents.some((ua) => userAgent.toLowerCase().includes(ua))) {
    return true
  }

  // Check for too many headers (potential header bombing) - increased limit
  if (Array.from(request.headers.keys()).length > 200) {
    return true
  }

  // Check for unusual methods
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

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Block suspicious requests
  if (isSuspiciousRequest(request)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  if (pathname.startsWith("/api/")) {
    const rateLimitResponse = rateLimit(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
  }

  if (pathname.startsWith("/admin")) {
    const allowed = await isAdmin()
    if (!allowed) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  const response = NextResponse.next()

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }

  const pathnameStr = pathname
  if (pathnameStr === "/characters/") {
    return NextResponse.redirect(
      new URL("/archive/characters/" + pathnameStr.split("/")[2], request.url)
    )
  }
  if (pathnameStr === "/weapons/") {
    return NextResponse.redirect(
      new URL("/archive/weapons/" + pathnameStr.split("/")[2], request.url)
    )
  }
  if (pathnameStr === "/artifacts/") {
    return NextResponse.redirect(
      new URL("/archive/artifacts/" + pathnameStr.split("/")[2], request.url)
    )
  }

  return response
}

export const proxyConfig = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/characters/:path*",
    "/weapons/:path*",
    "/artifacts/:path*",
  ],
}
