"use server"
import { signIn } from "@/app/(auth)/auth"
import { redirect } from "next/navigation"
import { verifyRecaptcha } from "@/lib/recaptcha"

export async function handleLogin(
  recaptchaToken?: string,
  formData?: FormData
) {
  // Verify reCAPTCHA if token is provided
  if (recaptchaToken) {
    const recaptchaResult = await verifyRecaptcha(recaptchaToken)

    if (!recaptchaResult.success) {
      console.error("reCAPTCHA verification failed:", recaptchaResult.error)
      throw new Error(`reCAPTCHA verification failed: ${recaptchaResult.error}`)
    }

    console.log("reCAPTCHA verification passed, score:", recaptchaResult.score)
  } else {
    console.warn("No reCAPTCHA token provided")
  }

  await signIn("discord", { callbackUrl: "/" })
}
