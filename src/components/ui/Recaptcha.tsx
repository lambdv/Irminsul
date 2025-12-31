"use client"

import { useEffect, useRef, useState } from "react"
import { getRecaptchaSiteKey, isRecaptchaConfigured } from "@/lib/recaptcha"

interface RecaptchaProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: () => void
  className?: string
}

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          "expired-callback"?: () => void
          "error-callback"?: () => void
          theme?: "light" | "dark"
          size?: "normal" | "compact"
        }
      ) => number
      reset: (widgetId?: number) => void
      execute: (
        sitekey: string,
        options: {
          action: string
        }
      ) => Promise<string>
    }
  }
}

export default function Recaptcha({
  onVerify,
  onExpire,
  onError,
  className = "",
}: RecaptchaProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isScriptLoading, setIsScriptLoading] = useState(false)
  const widgetRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isRecaptchaConfigured()) {
      console.error("Google reCAPTCHA is not configured")
      onError?.()
      return
    }

    // Load reCAPTCHA script
    if (!window.grecaptcha && !isScriptLoading) {
      setIsScriptLoading(true)
      const script = document.createElement("script")
      script.src = `https://www.google.com/recaptcha/api.js?render=explicit`
      script.async = true
      script.defer = true

      script.onload = () => {
        setIsScriptLoading(false)
        setIsLoaded(true)
      }

      script.onerror = () => {
        setIsScriptLoading(false)
        console.error("Failed to load reCAPTCHA script")
        onError?.()
      }

      document.head.appendChild(script)
    } else if (window.grecaptcha) {
      setIsLoaded(true)
    }
  }, [isScriptLoading, onError])

  useEffect(() => {
    if (isLoaded && window.grecaptcha && containerRef.current) {
      const siteKey = getRecaptchaSiteKey()

      widgetRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        "expired-callback": () => {
          onExpire?.()
        },
        "error-callback": () => {
          onError?.()
        },
        theme: "light",
        size: "normal",
      })
    }

    return () => {
      if (widgetRef.current !== null && window.grecaptcha) {
        window.grecaptcha.reset(widgetRef.current)
      }
    }
  }, [isLoaded, onVerify, onExpire, onError])

  const resetRecaptcha = () => {
    if (widgetRef.current !== null && window.grecaptcha) {
      window.grecaptcha.reset(widgetRef.current)
    }
  }

  if (!isRecaptchaConfigured()) {
    return (
      <div className={`text-sm text-red-500 ${className}`}>
        reCAPTCHA is not configured
      </div>
    )
  }

  if (isScriptLoading) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Loading reCAPTCHA...
      </div>
    )
  }

  return (
    <div className={`recaptcha-container ${className}`}>
      <div ref={containerRef} />
    </div>
  )
}

// For programmatic use with reCAPTCHA v3
export function useRecaptchaV3() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isScriptLoading, setIsScriptLoading] = useState(false)

  useEffect(() => {
    if (!isRecaptchaConfigured()) {
      console.error("Google reCAPTCHA is not configured")
      return
    }

    if (!window.grecaptcha && !isScriptLoading) {
      setIsScriptLoading(true)
      const script = document.createElement("script")
      script.src = `https://www.google.com/recaptcha/api.js?render=${getRecaptchaSiteKey()}`
      script.async = true
      script.defer = true

      script.onload = () => {
        setIsScriptLoading(false)

        if (window.grecaptcha) {
          window.grecaptcha.ready(() => {
            setIsLoaded(true)
          })
        }
      }

      script.onerror = () => {
        setIsScriptLoading(false)
        console.error("Failed to load reCAPTCHA v3 script")
      }

      document.head.appendChild(script)
    } else if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        setIsLoaded(true)
      })
    }
  }, [isScriptLoading])

  const executeRecaptcha = async (
    action: string = "submit"
  ): Promise<string | null> => {
    if (!isLoaded || !window.grecaptcha || !isRecaptchaConfigured()) {
      return null
    }

    try {
      const token = await window.grecaptcha.execute(getRecaptchaSiteKey(), {
        action,
      })
      return token
    } catch (error) {
      console.error("reCAPTCHA v3 execution error:", error)
      return null
    }
  }

  return {
    isLoaded,
    executeRecaptcha,
  }
}
