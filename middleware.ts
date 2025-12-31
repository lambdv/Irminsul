import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { isUserSupporterByEmail } from "@/app/(main)/pricing/actions"
import { verifyRecaptcha } from "./src/lib/recaptcha"

export async function middleware(request: NextRequest) {
  // Skip subscription check for API routes, static files, and auth-related pages
  if (
    !request.nextUrl.pathname.startsWith("/api/") &&
    !request.nextUrl.pathname.startsWith("/_next/") &&
    request.nextUrl.pathname !== "/favicon.ico" &&
    request.nextUrl.pathname !== "/login" &&
    request.nextUrl.pathname !== "/pricing" &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      })

      if (!token?.email) {
        // User is not authenticated, redirect to Stripe checkout
        return NextResponse.redirect(
          "https://buy.stripe.com/5kQ8wPbCc5e2gabfC5awo03"
        )
      }

      // Check if user is a supporter
      const isSupporter = await isUserSupporterByEmail(token.email)
      if (!isSupporter) {
        // User is authenticated but not a supporter, redirect to Stripe checkout with prefilled email
        return NextResponse.redirect(
          `https://buy.stripe.com/5kQ8wPbCc5e2gabfC5awo03?prefilled_email=${encodeURIComponent(token.email)}`
        )
      }
    } catch (error) {
      console.error("Middleware subscription check error:", error)
      // If there's an error, redirect to Stripe checkout to be safe
      return NextResponse.redirect(
        "https://buy.stripe.com/5kQ8wPbCc5e2gabfC5awo03"
      )
    }
  }

  // Only apply reCAPTCHA validation to authentication routes
  if (
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname.startsWith("/login")
  ) {
    // For POST requests with reCAPTCHA token in headers
    if (request.method === "POST") {
      const recaptchaToken = request.headers.get("x-recaptcha-token")

      if (recaptchaToken) {
        const clientIP =
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown"

        const recaptchaResult = await verifyRecaptcha(recaptchaToken, clientIP)

        if (!recaptchaResult.success) {
          console.error(
            "reCAPTCHA middleware validation failed:",
            recaptchaResult.error
          )

          // Return JSON error for API routes
          if (request.nextUrl.pathname.startsWith("/api/")) {
            return NextResponse.json(
              { error: "reCAPTCHA validation failed" },
              { status: 403 }
            )
          }

          // For page routes, redirect with error
          const loginUrl = new URL("/login", request.url)
          loginUrl.searchParams.set("error", "recaptcha_failed")
          return NextResponse.redirect(loginUrl)
        }

        console.log(
          "reCAPTCHA middleware validation passed, score:",
          recaptchaResult.score
        )
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
