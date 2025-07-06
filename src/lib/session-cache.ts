import React from 'react'

interface SessionData {
  user?: {
    id?: string
    name?: string
    email?: string
    image?: string
  }
  expires?: string
}

interface SessionState {
  data: SessionData | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  error?: string
  lastFetch?: number
}

class SessionCache {
  private cache: SessionState = {
    data: null,
    status: 'loading'
  }
  
  private subscribers: Set<() => void> = new Set()
  private activeRequest: Promise<SessionData | null> | null = null
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private readonly REQUEST_TIMEOUT = 10000 // 10 seconds

  // Subscribe to session changes
  subscribe(callback: () => void) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  // Get current session state
  getState(): SessionState {
    return { ...this.cache }
  }

  // Check if cache is valid
  private isCacheValid(): boolean {
    if (!this.cache.lastFetch) return false
    return Date.now() - this.cache.lastFetch < this.CACHE_DURATION
  }

  // Notify all subscribers
  private notifySubscribers() {
    this.subscribers.forEach(callback => callback())
  }

  // Update cache and notify subscribers
  private updateCache(newState: Partial<SessionState>) {
    this.cache = { ...this.cache, ...newState }
    this.notifySubscribers()
  }

  // Fetch session from API with timeout
  private async fetchSessionFromAPI(): Promise<SessionData | null> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT)

    try {
      const response = await fetch('/api/auth/session', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return data || null
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Session request timed out')
      }
      throw error
    }
  }

  // Get session with caching and deduplication
  async getSession(force = false): Promise<SessionData | null> {
    // Return cached data if valid and not forced
    if (!force && this.isCacheValid() && this.cache.status !== 'loading') {
      return this.cache.data
    }

    // If there's already an active request, wait for it
    if (this.activeRequest) {
      try {
        return await this.activeRequest
      } catch (error) {
        // If the active request fails, we'll try again below
        this.activeRequest = null
      }
    }

    // Create new request
    this.activeRequest = this.fetchSessionFromAPI()

    // Update status to loading
    this.updateCache({ status: 'loading' })

    try {
      const sessionData = await this.activeRequest
      
      // Update cache with new data
      this.updateCache({
        data: sessionData,
        status: sessionData ? 'authenticated' : 'unauthenticated',
        lastFetch: Date.now(),
        error: undefined
      })

      return sessionData
    } catch (error) {
      // Update cache with error
      this.updateCache({
        status: 'unauthenticated',
        data: null,
        error: error.message,
        lastFetch: Date.now()
      })
      
      console.error('Session fetch failed:', error)
      return null
    } finally {
      this.activeRequest = null
    }
  }

  // Clear cache (useful for logout)
  clearCache() {
    this.cache = {
      data: null,
      status: 'unauthenticated',
      lastFetch: Date.now()
    }
    this.activeRequest = null
    this.notifySubscribers()
  }

  // Logout function that clears cache and calls logout API
  async logout() {
    this.clearCache()
    
    try {
      // Call the logout API endpoint
      await fetch('/api/logout', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if logout fails, clear local cache and redirect
      this.clearCache()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }

  // Preload session (useful for hard reloads)
  preloadSession() {
    if (typeof window !== 'undefined' && !this.isCacheValid()) {
      this.getSession(false).catch(() => {
        // Ignore errors during preload
      })
    }
  }
}

// Export singleton instance
export const sessionCache = new SessionCache()

// React hook for using session cache
export function useSessionCache() {
  const [state, setState] = React.useState(() => sessionCache.getState())

  React.useEffect(() => {
    const unsubscribe = sessionCache.subscribe(() => {
      setState(sessionCache.getState())
    })

    // Trigger initial load if needed
    if (state.status === 'loading') {
      sessionCache.getSession()
    }

    return () => {
      unsubscribe()
    }
  }, [state.status])

  return {
    session: state.data,
    status: state.status,
    error: state.error,
    isAuthenticated: state.status === 'authenticated',
    user: state.data?.user || null,
    refresh: () => sessionCache.getSession(true),
    clearCache: () => sessionCache.clearCache(),
    logout: () => sessionCache.logout()
  }
}

// Initialize preload on client-side
if (typeof window !== 'undefined') {
  // Preload session on page load
  sessionCache.preloadSession()
  
  // Clear cache on storage events (useful for multi-tab logout)
  window.addEventListener('storage', (event) => {
    if (event.key === 'nextauth.session-token' || event.key === '__Secure-nextauth.session-token') {
      sessionCache.clearCache()
    }
  })
} 