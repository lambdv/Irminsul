"use client"
import React, { use, useEffect, useState } from 'react'
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
    const {togglePalette} = SearchStore()
    const {setIsSupporter} = GlobalStore()
    const { session } = useSessionContext()

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
        // Check if user is supporter based on session data
        if(session?.user?.email) {
            // You might want to add a supporter flag to the session or make an API call
            // For now, we'll set it to false
            setIsSupporter(false)
        }
    }, [session, setIsSupporter]); // Added session and setIsSupporter to the dependency array
    

    return (
        <>
            {props.children}
        </>
    )
}
