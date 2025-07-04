"use client"
import React, { useEffect, useState } from 'react'
import { useSessionContext } from '@/lib/session-context'

export default function SessionTest() {
  const { session, status, isAuthenticated, user } = useSessionContext()
  const [apiCallCount, setApiCallCount] = useState(0)
  const [lastCallTime, setLastCallTime] = useState<number>(0)

  useEffect(() => {
    // Monitor fetch calls to session API
    const originalFetch = window.fetch
    
    window.fetch = async function(url, options) {
      if (url === '/api/auth/session') {
        setApiCallCount(prev => prev + 1)
        setLastCallTime(Date.now())
        console.log(`Session API call #${apiCallCount + 1} at ${new Date().toISOString()}`)
      }
      
      return originalFetch.apply(this, arguments)
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [apiCallCount])

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h3>Session Test Monitor</h3>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>API Calls:</strong> {apiCallCount}</p>
      <p><strong>Last Call:</strong> {lastCallTime ? new Date(lastCallTime).toLocaleTimeString() : 'None'}</p>
      <p><strong>User:</strong> {user?.name || 'None'}</p>
      <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
      <div style={{ marginTop: '10px', fontSize: '10px', color: '#ccc' }}>
        <p>This component monitors session API calls.</p>
        <p>Hard reload should show ~1 call, navigation should show 0 calls.</p>
      </div>
    </div>
  )
} 