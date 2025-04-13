import Link from 'next/link'
import React from 'react'

export default function Gatekeeper() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '80vh',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
        <div style={{
          width: '100%',
          maxWidth: '28rem',
          borderRadius: '0.5rem',
          border: '1px solid rgb(38, 38, 38)',
          backgroundColor: 'rgba(1, 1, 1, 0.95)',
          padding: '2rem',
        }}>
            <div style={{marginBottom: '1.5rem'}}>
                <div style={{
                  textAlign: 'center',
                  marginBottom: '0.5rem'
                }}>
                    <h1 style={{
                      fontSize: '1.875rem',
                      lineHeight: '2.25rem',
                      fontWeight: 600,
                      letterSpacing: '-0.025em',
                      color: 'rgb(249, 250, 251)'
                    }}>Authentication Required</h1>
                    <p style={{color: 'rgb(156, 163, 175)'}}>Please sign in to continue to Seelie</p>
                </div>
                <div style={{marginTop: '1rem'}}>
                    

                </div>
            </div>
        </div>
    </div>
  )
}
