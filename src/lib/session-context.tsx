"use client"
import React, { createContext, useContext, ReactNode, useMemo } from 'react'
import { useUser, useAuth, useClerk } from '@clerk/nextjs'

interface SessionContextType {
  session: any
  status: 'loading' | 'authenticated' | 'unauthenticated'
  isAuthenticated: boolean
  user: any
  refresh: () => void
  clearCache: () => void
  logout: () => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded: userLoaded } = useUser()
  const { isSignedIn, isLoaded: authLoaded } = useAuth()
  const clerk = useClerk()
  
  const status = useMemo(() => {
    if (!userLoaded || !authLoaded) return 'loading'
    return isSignedIn ? 'authenticated' : 'unauthenticated'
  }, [userLoaded, authLoaded, isSignedIn])
  
  const sessionUser = useMemo(() => {
    if (!user) return null
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || null,
      name: user.fullName || user.firstName || null,
      image: user.imageUrl || null,
    }
  }, [user])
  
  const logout = async () => {
    await clerk.signOut()
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }
  
  const value: SessionContextType = {
    session: isSignedIn ? { user: sessionUser } : null,
    status,
    isAuthenticated: isSignedIn || false,
    user: sessionUser,
    refresh: () => {
      // Clerk automatically refreshes, but we can trigger a re-fetch
      if (user) {
        user.reload()
      }
    },
    clearCache: () => {
      // Clerk handles caching internally, this is a no-op
    },
    logout
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSessionContext() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSessionContext must be used within a SessionProvider')
  }
  return context
} 