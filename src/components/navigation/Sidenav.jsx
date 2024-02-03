'use client'

import Link from "next/link";
import { usePathname } from 'next/navigation'
import Image from "next/image";
import { useEffect } from "react";
import Waves from '../../js/waves'
import Script from "next/script";
import SidenavCSS from "../../css/sidenav.module.css"

//images
import characterIcon from '../../assets/icons/characterIcon.png'
import weaponIcon from '../../assets/icons/weaponIcon.png'
import artifactIcon from '../../assets/icons/artifactIcon.png'
import teamIcon from '../../assets/icons/teamIcon.png'
import leafIcon from '../../assets/icons/leaf.png'


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

      <Link href="/teams" className={pathname.includes('teams') ? 'active' : ''}>
        <button className={` waves-effect waves-light ripple`}>
        <Image src={teamIcon} alt="" />
        </button>
        <p>TeamDPS</p>
      </Link>
    </nav>
  )
}
