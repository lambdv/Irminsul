"use client"
import { SignIn } from "@clerk/nextjs"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState, useLayoutEffect } from "react"

export default function SignInCatchAll(props: {message?: string}) {
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  
  useLayoutEffect(() => {
    // Prevent scrolling on login page - apply to all levels
    // Use useLayoutEffect to apply styles before browser paint
    const html = document.documentElement
    const body = document.body
    const parentContainer = document.querySelector('.focusedPageContentContainer')
    
    // Store original values
    const originalHtmlOverflow = html.style.overflow
    const originalBodyOverflow = body.style.overflow
    const originalBodyHeight = body.style.height
    const originalContainerOverflow = parentContainer ? (parentContainer as HTMLElement).style.overflow : ''
    const originalContainerHeight = parentContainer ? (parentContainer as HTMLElement).style.height : ''
    const originalContainerMinHeight = parentContainer ? (parentContainer as HTMLElement).style.minHeight : ''
    
    // Apply no-scroll styles
    html.style.overflow = 'hidden'
    html.style.height = '100vh'
    body.style.overflow = 'hidden'
    body.style.height = '100vh'
    body.style.position = 'fixed'
    body.style.width = '100%'
    
    if (parentContainer) {
      const container = parentContainer as HTMLElement
      container.style.overflow = 'hidden'
      container.style.height = '100vh'
      container.style.minHeight = '100vh'
      container.style.maxHeight = '100vh'
      container.style.position = 'relative'
    }
    
    // Get theme from cookie or data attribute
    const getTheme = () => {
      const themeCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("theme="))
        ?.split("=")[1]
      const dataTheme = document.documentElement.getAttribute("data-theme")
      return (themeCookie || dataTheme || "dark") as "dark" | "light"
    }
    
    setTheme(getTheme())
    
    // Watch for theme changes
    const observer = new MutationObserver(() => {
      setTheme(getTheme())
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    })
    
    if (isSignedIn) {
      router.push("/")
    }
    
    return () => {
      // Restore original values
      html.style.overflow = originalHtmlOverflow
      html.style.height = ''
      body.style.overflow = originalBodyOverflow
      body.style.height = originalBodyHeight
      body.style.position = ''
      body.style.width = ''
      if (parentContainer) {
        const container = parentContainer as HTMLElement
        container.style.overflow = originalContainerOverflow
        container.style.height = originalContainerHeight
        container.style.minHeight = originalContainerMinHeight
        container.style.maxHeight = ''
        container.style.position = ''
      }
      observer.disconnect()
    }
  }, [isSignedIn, router])
  
  useEffect(() => {
    document.title = "Login | Irminsul"
  }, [])
  
  return (
    <div className="h-screen flex items-center justify-center px-4 overflow-hidden" style={{ height: '100vh', overflow: 'hidden' }}>
      <div className="w-full max-w-md">
        {props.message && (
          <div className="p-4 rounded-lg bg-muted border border-border text-sm text-foreground mb-4">
            <p>{props.message}</p>
          </div>
        )}
        
        <div className="flex justify-center">
          <SignIn 
            appearance={{
              baseTheme: theme as any,
              variables: {
                colorPrimary: "#F49F1E",
                colorBackground: theme === "dark" ? "#070707" : "#f1f1f1",
                colorText: theme === "dark" ? "#ececec" : "#191919",
                colorInputBackground: theme === "dark" ? "#2d2d2d" : "#e7e6e6",
                colorInputText: theme === "dark" ? "#ececec" : "#191919",
                borderRadius: "0.5rem",
              },
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg border border-gray-300 dark:border-gray-600",
                headerTitle: "text-card-foreground text-xl font-semibold",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "border-border bg-background hover:bg-accent text-foreground",
                formButtonPrimary: "bg-[#F49F1E] hover:bg-[#e7c073] text-white",
                formFieldInput: "bg-input text-input-foreground border-border",
                formFieldLabel: "text-foreground",
                footerActionLink: "text-primary hover:text-primary/80",
              },
            }}
            routing="path"
            path="/login"
            signUpUrl="/sign-up"
            afterSignInUrl="/"
            fallbackRedirectUrl="/"
          />
        </div>
      </div>
    </div>
  )
}
