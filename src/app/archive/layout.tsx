import React from 'react'
import LeftSidenav from '@/components/navigation/LeftSidenav'
import Link from 'next/link'

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <>
        {/* <LeftSidenav>
            <ul>
                <li><Link href="/archive/characters">Characters</Link></li>
                <li><Link href="/archive/weapons">Weapons</Link></li>
                <li><Link href="/archive/artifacts">Artifacts</Link></li>
            </ul>
        </LeftSidenav> */}
        {children}
    </>
  )
}
