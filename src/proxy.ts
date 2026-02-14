import { NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"
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

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }

  return response
}

function getArchiveRedirect(request: NextRequest): NextResponse | null {
  const { pathname, search } = request.nextUrl

  const redirectMap: Record<string, string> = {
    "/characters": "characters",
    "/weapons": "weapons",
    "/artifacts": "artifacts",
  }

  for (const [legacyPath, archiveSection] of Object.entries(redirectMap)) {
    if (!pathname.startsWith(legacyPath)) {
      continue
    }

    const parts = pathname.split("/").filter(Boolean)
    const slug = parts[1]
    const targetPath = slug
      ? `/archive/${archiveSection}/${slug}`
      : `/archive/${archiveSection}`

    return NextResponse.redirect(new URL(`${targetPath}${search}`, request.url))
  }

  return null
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (isSuspiciousRequest(request)) {
    return applySecurityHeaders(new NextResponse("Forbidden", { status: 403 }))
  }

  if (pathname.startsWith("/api/")) {
    const rateLimitResponse = rateLimit(request)
    if (rateLimitResponse) {
      return applySecurityHeaders(rateLimitResponse)
    }
  }

  if (pathname.startsWith("/admin")) {
    const allowed = await isAdmin()
    if (!allowed) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL("/", request.url))
      )
    }
  }

  const archiveRedirect = getArchiveRedirect(request)
  if (archiveRedirect) {
    return applySecurityHeaders(archiveRedirect)
  }

  return applySecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/characters/:path*",
    "/weapons/:path*",
    "/artifacts/:path*",
  ],
}
