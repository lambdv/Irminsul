'use client'

import Link from "next/link";
import { usePathname } from 'next/navigation'
import Image from "next/image";
import { useEffect } from "react";
import Waves from '@/hooks/waves'
import Script from "next/script";
import SidenavCSS from "./sidenav.module.css"

//images
import characterIcon from '@/public/assets/icons/characterIcon.png'
import weaponIcon from '@/public/assets/icons/weaponIcon.png'
import artifactIcon from '@/public/assets/icons/artifactIcon.png'
import teamIcon from '@/public/assets/icons/teamIcon.png'
import leafIcon from '@/public/assets/icons/leaf.png'
import enemyIcon from '@/public/assets/icons/enemyIcon.png'
import wishIcon from '@/public/assets/icons/wish.png'


export default function Sidenav() {
  const pathname = usePathname()

  useEffect(() => {
    Waves.attach('.ripple', ['waves-effect', 'waves-light']);
    Waves.init();
  }, []);

  return (
    <nav className={SidenavCSS.sidenav}>
      <Link href="/" className={pathname === '/' ? 'active' : ''}>
        <button className={` waves-effect waves-light ripple`}>
          <Image src={leafIcon} alt="" className="SidenavCSS.iconImage"/>
        </button>
        <p>Home</p>
      </Link>

      <Link href="/characters" className={pathname.includes('characters') ? 'active' : ''}>
        <button className={` waves-effect waves-light ripple`}>
          <Image src={characterIcon} alt="" />
        </button>
        <p>Characters</p>
      </Link>

      <Link href="/weapons" className={pathname.includes('weapons') ? 'active' : ''}>
        <button className={` waves-effect waves-light ripple`}>
          <Image src={weaponIcon} alt="" />
        </button>
        <p>Weapons</p>
      </Link>

      <Link href="/artifacts" className={pathname.includes('artifacts') ? 'active' : ''}>
        <button className={` waves-effect waves-light ripple`}>
          <Image src={artifactIcon} alt="" />
        </button>
        <p>Artifacts</p>
      </Link>

      {/* <Link href="/banners" className={pathname.includes('banners') ? 'active' : ''}>
        <button className={` waves-effect waves-light ripple`}>
          <Image src={wishIcon} alt="" />
        </button>
        <p>Banners</p>
      </Link>

      <Link href="/enemies" className={pathname.includes('enemies') ? 'active' : ''}>
        <button className={` waves-effect waves-light ripple`}>
          <Image src={enemyIcon} alt="" />
        </button>
        <p>Enemies</p>
      </Link> */}

      <Link href="/teams" className={pathname.includes('teams') ? 'active' : ''}>
        <button className={` waves-effect waves-light ripple`}>
        <Image src={teamIcon} alt="" />
        </button>
        <p>Teams</p>
      </Link>
    </nav>
  )
}
