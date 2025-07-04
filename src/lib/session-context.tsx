"use client"
import React, { createContext, useContext, ReactNode } from 'react'
import { useSessionCache } from './session-cache'

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
  const { session, status, isAuthenticated, user, refresh, clearCache, logout } = useSessionCache()
  
  const value: SessionContextType = {
    session,
    status,
    isAuthenticated,
    user,
    refresh,
    clearCache,
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