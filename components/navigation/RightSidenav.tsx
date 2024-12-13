'use client'

import Link from "next/link";
import { usePathname } from 'next/navigation'
import Image from "next/image";
import { use, useEffect, useState } from "react";
import Waves from '@/scripts/waves'
import Script from "next/script";
import SidenavCSS from "@/components/navigation/sidenav.module.css";
import modalCSS from '../ui/modal.module.css'
import { NavigationStore } from "@/store/Navigation";
import Overlay from '../ui/Overlay';
import RightSidenavCSS from '@/components/navigation/rightsidenav.module.css'

//images
import characterIcon from '@/public/assets/icons/characterIcon.png'
import weaponIcon from '@/public/assets/icons/weaponIcon.png'
import artifactIcon from '@/public/assets/icons/artifactIcon.png'
import teamIcon from '@/public/assets/icons/teamIcon.png'
import leafIcon from '@/public/assets/icons/leaf.png'
import enemyIcon from '@/public/assets/icons/enemyIcon.png'
import wishIcon from '@/public/assets/icons/wish.png'


export default function RightSidenav() {
  const pathname = usePathname(); //get url path
  const { sideNavCollapsed, setSideNavCollapsed } = NavigationStore(); //get sidenav state
  const [activePage, setActivePage] = useState('');
  const [windowWidth, setWindowWidth] = useState(1000);

  return (
    <>
      <nav className={RightSidenavCSS.rightsidenav} style={{zIndex: 10}}>
        <p>adge</p>
      </nav>
    </>
  );
}