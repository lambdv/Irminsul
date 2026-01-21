"use client"
import { ClerkProvider } from "@clerk/nextjs"
import { useEffect, useState } from "react"

export function ClerkThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
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

    return () => observer.disconnect()
  }, [])

  return (
    <ClerkProvider
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
          card: "shadow-lg bg-card border border-gray-300 dark:border-gray-600",
          headerTitle: "text-card-foreground",
          headerSubtitle: "hidden",
          socialButtonsBlockButton:
            "border-border bg-background hover:bg-accent text-foreground",
          formButtonPrimary: "bg-[#F49F1E] hover:bg-[#e7c073] text-white",
          formFieldInput: "bg-input text-input-foreground border-border",
          formFieldLabel: "text-foreground",
          footerActionLink: "text-primary hover:text-primary/80",
          identityPreviewText: "text-foreground",
          identityPreviewEditButton: "text-primary hover:text-primary/80",
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
