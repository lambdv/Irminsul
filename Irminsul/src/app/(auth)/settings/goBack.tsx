"use client"
import React from 'react'
import RoundBtn from '@/components/ui/RoundBtn'
import { useRouter } from 'next/navigation'

export default function GoBack() {
    const router = useRouter()
    //if router.back has no history, redirect to /
    const goBack = () => {
        if (router.back() === undefined) {
            router.push('/')
        } 
        else {
            router.back()
        }
    }
    return (
        <RoundBtn icon="arrow_back" onClick={goBack} />
    )
}

