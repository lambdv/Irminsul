"use client"
import React, { use, useEffect, useState, useMemo } from 'react'
import Script from "next/script"
import "@/lib/waves/waves.css"
import Waves from '@/lib/waves/waves.js'
import { usePathname } from 'next/navigation'
import { NavigationStore } from "@/store/Navigation"
import { SearchStore } from "@/store/Search"
import { GlobalStore } from "@/store/global"
import { shallow } from 'zustand/shallow'
import { useSessionContext } from '@/lib/session-context'

/**
 * Wrapper around the whole website to allow for global client-side scripts
 * @note children props inside this component can still be rendered on the server
 * @param props 
 */
export default function ClientWrapper(props: any) {
    const {togglePalette} = SearchStore(
        (state) => ({ togglePalette: state.togglePalette }),
        shallow
    )
    const {setIsSupporter, isSupporter} = GlobalStore(
        (state) => ({ setIsSupporter: state.setIsSupporter, isSupporter: state.isSupporter }),
        shallow
    )
    const { session } = useSessionContext()

    // Memoize the supporter check to prevent unnecessary re-renders
    const supporterStatus = useMemo(() => {
        if (session?.user?.email) {
            // You might want to add a supporter flag to the session or make an API call
            // For now, we'll set it to false
            return false
        }
        return false
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
        // Only update if the supporter status has actually changed
        if (supporterStatus !== isSupporter) {
            setIsSupporter(supporterStatus)
        }
    }, [supporterStatus, isSupporter, setIsSupporter]); // Added proper dependencies
    

    return (
        <>
            {props.children}
        </>
    )
}
