"use client"
import React from 'react'
import RoundBtn from '@/components/ui/RoundBtn'
import { useRouter } from 'next/navigation'

export default function GoBack() {
    const router = useRouter()
    return (
        <RoundBtn icon="arrow_back" onClick={() => router.back()} />
    )
}

