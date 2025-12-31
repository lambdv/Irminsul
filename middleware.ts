import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { isUserSupporterByEmail } from "@/app/(main)/pricing/actions"

export async function middleware(request: NextRequest) {
  // // Only apply to AI route
  // if (request.nextUrl.pathname === "/ai") {
  //   let token

  //   try {
  //     token = await getToken({
  //       req: request,
  //       secret: process.env.NEXTAUTH_SECRET,
  //     })

  //     if (!token?.email) {
  //       // User is not authenticated, redirect to Pro tier checkout
  //       const proCheckoutUrl = "https://buy.stripe.com/5kQ8wPbCc5e2gabfC5awo03"
  //       return NextResponse.redirect(proCheckoutUrl)
  //     }

  //     // Check if user is a supporter
  //     const isSupporter = await isUserSupporterByEmail(token.email)
  //     if (!isSupporter) {
  //       // User is not a supporter, redirect to Pro tier checkout
  //       const proCheckoutUrl = "https://buy.stripe.com/5kQ8wPbCc5e2gabfC5awo03"
  //       return NextResponse.redirect(proCheckoutUrl)
  //     }
  //   } catch (error) {
  //     console.error("Middleware error:", error)
  //     // If there's an error, proceed to normal flow
  //   }
  // }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login, pricing, auth pages (don't redirect from these)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|pricing|auth).*)",
  ],
}
