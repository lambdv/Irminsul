'use client'

import Link from "next/link";
import { usePathname } from 'next/navigation'
import Image from "next/image";
import { useEffect } from "react";
import Waves from '../../js/waves'


import SidenavCSS from "../../css/sidenav.module.css"

//images
import characterIcon from '../../assets/icons/characterIcon.png'
import weaponIcon from '../../assets/icons/weaponIcon.png'
import artifactIcon from '../../assets/icons/artifactIcon.png'
import teamIcon from '../../assets/icons/teamIcon.png'
import leafIcon from '../../assets/icons/leaf.png'
import Script from "next/script";


export default function Sidenav() {
  const pathname = usePathname()

  return (
    <nav className={SidenavCSS.sidenav}>


      <Link href="/" >
        <button className={`${pathname === '/' ? 'active' : ''} waves-effect waves-light ripple`}>
          <Image src={leafIcon} alt="" className="SidenavCSS.iconImage"/>
        </button>
        <p>Home</p>
      </Link>

      <Link href="/characters">
        <button className={`${pathname.includes('characters') ? 'active' : ''} waves-effect waves-light ripple`}>
          <Image src={characterIcon} alt="" />
        </button>
        <p>Characters</p>
      </Link>

      <Link href="/weapons">
        <button className={`${pathname.includes('weapons') ? 'active' : ''} waves-effect waves-light ripple`}>
          <Image src={weaponIcon} alt="" />
        </button>
        <p>Weapons</p>
      </Link>

      <Link href="/artifacts">
        <button className={`${pathname.includes('artifacts') ? 'active' : ''} waves-effect waves-light ripple`}>
          <Image src={artifactIcon} alt="" />
        </button>
        <p>Artifacts</p>
      </Link>

      <Link href="/teams">
        <button className={`${pathname.includes('teams') ? 'active' : ''} waves-effect waves-light ripple`}>
        <Image src={teamIcon} alt="" />
        </button>
        <p>TeamDPS</p>
      </Link>

      <Script src="../js/waves.js" defer />
    </nav>
  )
}
