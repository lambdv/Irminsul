'use client'

import Link from "next/link";
import { usePathname } from 'next/navigation'
import Image from "next/image";
import { use, useEffect, useState } from "react";
import Waves from '@/scripts/waves'
import Script from "next/script";
import SidenavCSS from "./sidenav.module.css"
import modalCSS from '../ui/modal.module.css'
import { NavigationStore } from "@/store/Navigation";
import Overlay from '../ui/Overlay';
import { flatten } from "@/utils/standardizers"

//images
import characterIcon from '@public/assets/icons/characterIcon.png'
import weaponIcon from '@public/assets/icons/weaponIcon.png'
import artifactIcon from '@public/assets/icons/artifactIcon.png'
import teamIcon from '@public/assets/icons/teamIcon.png'
import leafIcon from '@public/assets/icons/leaf.png'
import enemyIcon from '@public/assets/icons/enemyIcon.png'
import wishIcon from '@public/assets/icons/wish.png'

/**
 * Side navigation component
 */
export default function Sidenav() {
  const pathname = usePathname(); //get url path
  const { sideNavCollapsed, setSideNavCollapsed } = NavigationStore(); //get sidenav state
  const [activePage, setActivePage] = useState('');
  const [windowWidth, setWindowWidth] = useState(1201);

  useEffect(() => setActivePage(pathname), [pathname])
  useEffect(() => setWindowWidth(window.innerWidth), [])

  useEffect(() => { //handle sidenav state based on window width
    const handleSidenavState = (): void => {
      let width = window.innerWidth;
      if (width > 1200)
        setSideNavCollapsed(true);
      if (width <= 1200 && width >= 768)
        setSideNavCollapsed(true);
    }
    handleSidenavState();
    if (window.innerWidth < 768) setSideNavCollapsed(true);
    window.addEventListener('resize', handleSidenavState);
  }, [setSideNavCollapsed]);

  function SideNavLink(props: {href: string, text: string, img?: any, icon?: any}) {
    const handleSideNavLinkClick = (href: string) => setActivePage(href);
    return (
      <Link 
        href={props.href} 
        className={SidenavCSS.sidenavLink +' '+ (props.href === activePage && SidenavCSS.active) + (!sideNavCollapsed ? ' waves-effect waves-light ripple ' : ' ')}
        onClick={() => { 
          handleSideNavLinkClick(props.href)
          if (windowWidth < 1200) setSideNavCollapsed(true)
        }}  
      >
        <i className={SidenavCSS.sidenavLinkSymbol + ' material-symbols-outlined'}>
          {props.img ? <Image src={props.img} alt = {props.text} width={24} height={24} /> : props.icon}
        </i>
        <p>{props.text}</p>
      </Link>
    )
  }

  return (
    <>
      <nav className={SidenavCSS.sidenav + " " + (sideNavCollapsed && SidenavCSS.sidenavCollapsed)} style={{zIndex: 10}}>
        <SideNavLink href="/" icon="home" text="Home"/>
        <SideNavLink href="/characters" img={characterIcon} text="Characters"/>
        <SideNavLink href="/weapons" img={weaponIcon} text="Weapons"/>
        <SideNavLink href="/artifacts" img={artifactIcon} text="Artifacts"/>
        <SideNavLink href="/enemies" img={enemyIcon} text="Enemies"/>
        <SideNavLink href="/wishes" img={wishIcon} text="Banners"/>
        {/* <SideNavLink href="/" img={wishIcon} text="Articles"/>
        <SideNavLink href="/" img={wishIcon} text="Akademiya"/>
        <SideNavLink href="/" img={wishIcon} text="Calculator"/>
        <SideNavLink href="/wishes" img={wishIcon} text="SeelieGPT"/> */}
      </nav>
      {!sideNavCollapsed && windowWidth < 1200 && 
        <Overlay zIndex={2} onClick={() => setSideNavCollapsed(true)}/>
      }
    </>
  )
}