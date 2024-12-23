"use client"
import React, { use, useEffect, useState } from 'react'
import Script from "next/script"
import Waves from '@/app/waves'
import { usePathname } from 'next/navigation'
import { NavigationStore } from "@/store/Navigation"
import { SearchStore } from "@/store/Search"


/**
 * Wrapper around the whole website to allow for global client-side scripts
 * @note children props inside this component can still be rendered on the server
 * @param props 
 */
export default function ClientWrapper(props: any) {
    const {togglePalette} = SearchStore()

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
    })

    return (
        <>
            {props.children}
        </>
    )
}
