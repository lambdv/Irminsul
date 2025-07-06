"use client"
import React, { use, useEffect, useState, useMemo } from 'react'
import Script from "next/script"
import "@/lib/waves/waves.css"
import Waves from '@/lib/waves/waves.js'
import { usePathname } from 'next/navigation'
import { NavigationStore } from "@/store/Navigation"
import { SearchStore } from "@/store/Search"
import { GlobalStore } from "@/store/global"
import { useSessionContext } from '@/lib/session-context'

/**
 * Wrapper around the whole website to allow for global client-side scripts
 * @note children props inside this component can still be rendered on the server
 * @param props 
 */
export default function ClientWrapper(props: any) {
    const {togglePalette} = SearchStore((state) => ({ togglePalette: state.togglePalette }))
    const {setIsSupporter, isSupporter} = GlobalStore((state) => ({ 
        setIsSupporter: state.setIsSupporter, 
        isSupporter: state.isSupporter 
    }))
    const { session } = useSessionContext()

    // Memoize the supporter check to prevent unnecessary re-renders
    const supporterStatus = useMemo(() => {
        if (session?.user?.email) {
            // Return a promise that will be handled in useEffect
            return session.user.email
        }
        return null
    }, [session?.user?.email])

    //initialize waves effect
    useEffect(() => { 
        Waves.attach('.ripple', ['waves-effect', 'waves-light'])
        Waves.init()
    }, []);
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && (event.key === "/" || event.key === "k")) {
                event.preventDefault(); // Prevent the default browser action
                togglePalette();
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => {window.removeEventListener('keydown', handleKeyDown)}
    }, [togglePalette]); // Added togglePalette to the dependency array

    useEffect(() => {
        // Check supporter status when user email changes
        if (supporterStatus) {
            const checkSupporterStatus = async () => {
                try {
                    const response = await fetch(`/api/auth/supporter?email=${encodeURIComponent(supporterStatus)}`)
                    if (response.ok) {
                        const data = await response.json()
                        setIsSupporter(data.isSupporter)
                    }
                } catch (error) {
                    console.error('Error checking supporter status:', error)
                    setIsSupporter(false)
                }
            }
            checkSupporterStatus()
        } else {
            // No user email, set supporter to false
            setIsSupporter(false)
        }
    }, [supporterStatus]); // Only depend on email changes, remove setIsSupporter and isSupporter
    

    return (
        <>
            {props.children}
        </>
    )
}
