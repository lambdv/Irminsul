"use client";
import React, { use, useEffect, useState } from 'react'
import Script from "next/script";
import Waves from '@/scripts/waves'
import { usePathname } from 'next/navigation';
import { NavigationStore } from "@/store/Navigation";


/**
 * Wrapper around the whole website to allow for global client-side scripts
 * @note children props inside this component can still be rendered on the server
 * @param props 
 */
export default function ClientWrapper(props: any) {

    //initialize waves effect
    useEffect(() => { 
        Waves.attach('.ripple', ['waves-effect', 'waves-light'])
        Waves.init()
    }, [])

    return (
        <>{props.children}</>
    )
}
