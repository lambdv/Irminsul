"use client"
import { useRouter } from "next/navigation"
import { handleLogin } from "./handlelogin"
import Image from "next/image"
import { useSessionContext } from "@/lib/session-context"
import { redirect } from "next/navigation"
import loginStyle from "./login.module.css"
import { Metadata } from "next"
import { useEffect, useState } from "react"
import Recaptcha from "@/components/ui/Recaptcha"
import { useRecaptchaV3 } from "@/components/ui/Recaptcha"

// For Next.js 15, client components can't export metadata directly
// Instead, we'll use document.title to set the page title on the client side
export default function Page(props: { message?: string }) {
  const { status } = useSessionContext()
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { executeRecaptcha } = useRecaptchaV3()

  useEffect(() => {
    document.title = "Login | Irminsul"
  }, [])

  if (status === "authenticated") redirect("/")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Try reCAPTCHA v3 first (invisible)
      const v3Token = await executeRecaptcha("login")

      if (v3Token) {
        // Use the existing handleLogin with v3 token
        await handleLogin(v3Token)
      } else {
        // Fallback to manual reCAPTCHA v2 if v3 fails
        if (!recaptchaToken) {
          alert("Please complete the reCAPTCHA challenge")
          setIsLoading(false)
          return
        }
        await handleLogin(recaptchaToken)
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecaptchaVerify = (token: string) => {
    setRecaptchaToken(token)
  }

  const handleRecaptchaExpire = () => {
    setRecaptchaToken(null)
  }

  const handleRecaptchaError = () => {
    setRecaptchaToken(null)
    alert("reCAPTCHA error. Please refresh the page.")
  }

  return (
    <div className={loginStyle.loginContainer}>
      {props.message && (
        <div className={loginStyle.loginMessage}>
          <p>{props.message}</p>
        </div>
      )}
      <div className={loginStyle.loginWrapper}>
        <h1 className="text-2xl font-bold mb-2">Login</h1>
        <div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p
              className="font-light text-gray-500"
              style={{ fontSize: "12px", marginTop: "-5px" }}
            >
              irminsul accounts use discord&apos;s oauth2 for authentication.
              <br />
              learn more:{" "}
              <a
                href="https://discord.com/developers/docs/topics/oauth2"
                className="text-blue-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://discord.com/developers/docs/topics/oauth2
              </a>
            </p>

            {/* reCAPTCHA v2 fallback - will be shown only if needed */}
            <div className="flex justify-center">
              <Recaptcha
                onVerify={handleRecaptchaVerify}
                onExpire={handleRecaptchaExpire}
                onError={handleRecaptchaError}
              />
            </div>

            <button
              type="submit"
              className={loginStyle.loginButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Image
                    src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a6ca814282eca7172c6_icon_clyde_white_RGB.svg"
                    alt="Discord Icon"
                    width={20}
                    height={20}
                    className="select-none"
                    unoptimized={true}
                  />
                  <p>Sign in with Discord</p>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
