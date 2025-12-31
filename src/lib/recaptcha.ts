import { NextRequest } from "next/server"

interface RecaptchaResponse {
  success: boolean
  score?: number
  action?: string
  challenge_ts?: string
  hostname?: string
  "error-codes"?: string[]
}

export async function verifyRecaptcha(
  token: string,
  remoteIP?: string
): Promise<{
  success: boolean
  error?: string
  score?: number
}> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  if (!secretKey) {
    console.error("RECAPTCHA_SECRET_KEY is not configured")
    return { success: false, error: "reCAPTCHA not configured" }
  }

  if (!token) {
    return { success: false, error: "reCAPTCHA token is required" }
  }

  try {
    const verificationURL = new URL(
      "https://www.google.com/recaptcha/api/siteverify"
    )
    verificationURL.searchParams.append("secret", secretKey)
    verificationURL.searchParams.append("response", token)

    if (remoteIP) {
      verificationURL.searchParams.append("remoteip", remoteIP)
    }

    const response = await fetch(verificationURL.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    const data: RecaptchaResponse = await response.json()

    if (!data.success) {
      return {
        success: false,
        error:
          data["error-codes"]?.join(", ") || "reCAPTCHA verification failed",
      }
    }

    // For reCAPTCHA v3, check the score
    if (data.score !== undefined && data.score < 0.5) {
      return {
        success: false,
        error: "Low reCAPTCHA score detected",
        score: data.score,
      }
    }

    return {
      success: true,
      score: data.score,
    }
  } catch (error) {
    console.error("reCAPTCHA verification error:", error)
    return {
      success: false,
      error: "Failed to verify reCAPTCHA",
    }
  }
}

export function getRecaptchaSiteKey(): string {
  const siteKey = process.env.RECAPTCHA_SITE_KEY
  if (!siteKey) {
    throw new Error("RECAPTCHA_SITE_KEY is not configured")
  }
  return siteKey
}

export function isRecaptchaConfigured(): boolean {
  return !!(process.env.RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY)
}
