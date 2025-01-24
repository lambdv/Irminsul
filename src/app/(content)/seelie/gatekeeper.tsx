import Link from 'next/link'
import React from 'react'

export default function Gatekeeper() {
  return (
    <div className='flex flex-col items-center justify-center '>
        <h1 className='text-4xl font-bold'>Woops</h1>
        <p className='text-lg'>You need to be logged in to access this page</p>
        <Link href="/api/auth/signin" className='bg-blue-500 text-white px-4 py-2 rounded-md'>Login</Link>  
    </div>
  )
}
