"use client";
import React, { useEffect } from 'react'
import Script from "next/script";
import Waves from '@/hooks/waves'


export default function ClientWrapper(props: any) {

    useEffect(() => { //initialize waves effect
        Waves.attach('.ripple', ['waves-effect', 'waves-light']);
        Waves.init();
      }, []);

    return (
        <>
            {props.children}
        </>
    )
}
