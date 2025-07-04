"use client"
import { SessionProvider } from '@/lib/session-context'

export default function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
} 