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
import Overlay from '../ui/Overlay';

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
  const { sideNavCollapsed, setSideNavCollapsed } = NavigationStore(); //get sidenav state
  const [activePage, setActivePage] = useState('');

  useEffect(() => setActivePage(pathname), [pathname]);

  const handleSideNavLinkClick = (href: string) => setActivePage(href); //optimistic update
  
  useEffect(() => { //initialize waves effect
    Waves.attach('.ripple', ['waves-effect', 'waves-light']);
    Waves.init();
  }, []);

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

  function SideNavLink(props: any) {
    const { href, text, img, icon } = props;
    return (
      <Link 
        href={href} 
        className={SidenavCSS.sidenavLink +' '+ (activePage === href ? SidenavCSS.active : '') + (!sideNavCollapsed ? ' waves-effect waves-light ripple' : ' ')}
        onClick={() => handleSideNavLinkClick(href)}  
      >
        <i className={SidenavCSS.sidenavLinkSymbol + ' material-symbols-outlined'}>
          {img ? <Image src={img} alt = {text} width={24} height={24} /> : icon}
        </i>
        <p>{text}</p>
    </Link>
    );
  }

  return (<>
      <nav className={SidenavCSS.sidenav + " " + (sideNavCollapsed ? SidenavCSS.sidenavCollapsed : '')}>
        <SideNavLink href="/" icon="home" text="Home"/>
        <SideNavLink href="/characters" img={characterIcon} text="Characters"/>
        <SideNavLink href="/weapons" img={weaponIcon} text="Weapons"/>
        <SideNavLink href="/artifacts" img={artifactIcon} text="Artifacts"/>
        <SideNavLink href="/teams" img={teamIcon} text="Teams"/>
        <SideNavLink href="/enemies" img={enemyIcon} text="Enemies"/>
        <SideNavLink href="/wishes" img={wishIcon} text="Wishes"/>
      </nav>

      {!sideNavCollapsed && window.innerWidth < 768 && <Overlay zIndex={1} onClick={() => { setSideNavCollapsed(true) }}/>}
      
    </>);
}