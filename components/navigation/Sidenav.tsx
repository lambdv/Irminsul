'use client'

import Link from "next/link";
import { usePathname } from 'next/navigation'
import Image from "next/image";
import { use, useEffect, useState } from "react";
import Waves from '@/hooks/waves'
import Script from "next/script";
import SidenavCSS from "./sidenav.module.css"
import modalCSS from '../ui/modal.module.css'
import { NavigationStore } from "@/store/Navigation";

//images
import characterIcon from '@/public/assets/icons/characterIcon.png'
import weaponIcon from '@/public/assets/icons/weaponIcon.png'
import artifactIcon from '@/public/assets/icons/artifactIcon.png'
import teamIcon from '@/public/assets/icons/teamIcon.png'
import leafIcon from '@/public/assets/icons/leaf.png'
import enemyIcon from '@/public/assets/icons/enemyIcon.png'
import wishIcon from '@/public/assets/icons/wish.png'

export default function Sidenav() {
  const pathname = usePathname(); //get url path
  
  useEffect(() => { //initialize waves effect
    Waves.attach('.ripple', ['waves-effect', 'waves-light']);
    Waves.init();
  }, []);

  
  const { sideNavCollapsed, setSideNavCollapsed } = NavigationStore(); //get sidenav state

  useEffect(() => { //handle sidenav state based on window width
    const handleSidenavState = (): void => {
      let width = window.innerWidth;
      if (width > 1200)
        setSideNavCollapsed(false);
      if (width <= 1200 && width >= 768)
        setSideNavCollapsed(true);
    }

    handleSidenavState();

    if (window.innerWidth < 768) 
      setSideNavCollapsed(true);

    window.addEventListener('resize', handleSidenavState);
  }, []);

  return (
    <div>   
      <nav className={SidenavCSS.sidenav + " " + (sideNavCollapsed ? SidenavCSS.sidenavCollapsed : '')}>
        <Link href="/" className={SidenavCSS.sidenavLink +' '+ (pathname === '/' ? SidenavCSS.active : '') + (!sideNavCollapsed ? ' waves-effect waves-light ripple' : ' ')}>
            <i className={SidenavCSS.sidenavLinkSymbol + ' material-symbols-outlined'}>
              home
            </i>
            <p>Home</p>
        </Link>

        <Link href="/characters" className={SidenavCSS.sidenavLink +' '+ (pathname === '/characters' ? SidenavCSS.active : '') + (!sideNavCollapsed ? ' waves-effect waves-light ripple' : ' ')}>
            <i className={SidenavCSS.sidenavLinkSymbol + ' material-symbols-outlined'}>
              <Image src={characterIcon} alt="characters" width={100} height={100}/>
            </i>
            <p>Characters</p>
        </Link>

        <Link href="/weapons" className={SidenavCSS.sidenavLink +' '+ (pathname === '/weapons' ? SidenavCSS.active : '') + (!sideNavCollapsed ? ' waves-effect waves-light ripple' : ' ')}>
            <i className={SidenavCSS.sidenavLinkSymbol + ' material-symbols-outlined'}>
              <Image src={weaponIcon} alt="weapons" width={100} height={100}/>
            </i>

            <p>Weapons</p>

        </Link>

        <Link href="/artifacts" className={SidenavCSS.sidenavLink +' '+ (pathname === '/artifacts' ? SidenavCSS.active : '') + (!sideNavCollapsed ? ' waves-effect waves-light ripple' : ' ')}>
            <i className={SidenavCSS.sidenavLinkSymbol + ' material-symbols-outlined'}>
              <Image src={artifactIcon} alt="artifacts" width={100} height={100}/>
            </i>
            <p>Artifacts</p>
        </Link>
      </nav>
    </div>
  );
}