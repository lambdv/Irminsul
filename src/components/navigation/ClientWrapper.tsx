"use client"
import React, { useEffect, useMemo } from "react"
import Script from "next/script"
// import "@/lib/waves/waves.css"
// import Waves from "waves"
import { usePathname } from "next/navigation"
import { NavigationStore } from "@/store/Navigation"
import { SearchStore } from "@/store/Search"
import { GlobalStore } from "@/store/global"
import { useSessionContext } from "@/lib/session-context"

/**
 * Wrapper around the whole website to allow for global client-side scripts
 * @note children props inside this component can still be rendered on the server
 * @param props
 */
export default function ClientWrapper(props: any) {
  const { togglePalette } = SearchStore((state) => ({
    togglePalette: state.togglePalette,
  }))
  const { setIsSupporter, setUserTier } = GlobalStore((state) => ({
    setIsSupporter: state.setIsSupporter,
    setUserTier: state.setUserTier,
  }))
  const { session } = useSessionContext()

  // Memoize the user email to prevent unnecessary re-renders
  const userEmail = useMemo(() => {
    return session?.user?.email || null
  }, [session?.user?.email])

  //initialize waves effect
  // useEffect(() => {
  //   Waves.attach(".ripple", ["waves-effect", "waves-light"])
  //   Waves.init()
  // }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && (event.key === "/" || event.key === "k")) {
        event.preventDefault() // Prevent the default browser action
        togglePalette()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [togglePalette])

  useEffect(() => {
    // Check supporter status and tier when user email changes
    if (userEmail) {
      const checkUserStatus = async () => {
        try {
          // Check supporter status (legacy)
          const supporterResponse = await fetch(
            `/api/auth/supporter?email=${encodeURIComponent(userEmail)}`
          )
          if (supporterResponse.ok) {
            const supporterData = await supporterResponse.json()
            setIsSupporter(supporterData.isSupporter)
          }

          // Check user tier
          const tierResponse = await fetch(
            `/api/auth/tier?email=${encodeURIComponent(userEmail)}`
          )
          if (tierResponse.ok) {
            const tierData = await tierResponse.json()
            setUserTier(tierData.tier)
          }
        } catch (error) {
          console.error("Error checking user status:", error)
          setIsSupporter(false)
          setUserTier("free")
        }
      }
      checkUserStatus()
    } else {
      // No user email, reset to defaults
      setIsSupporter(false)
      setUserTier("free")
    }
  }, [userEmail, setIsSupporter, setUserTier])

  return <>{props.children}</>
}
