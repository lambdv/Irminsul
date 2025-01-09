"use client"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import Image from "next/image"
import { useEffect, useState } from "react"
import SidenavCSS from "./sidenav.module.css"
import { NavigationStore } from "@/store/Navigation"
import { SearchStore } from "@/store/Search"
import Overlay from '../ui/Overlay'
import characterIcon from '@public/assets/icons/characterIcon.png'
import weaponIcon from '@public/assets/icons/weaponIcon.png'
import artifactIcon from '@public/assets/icons/artifactIcon.png'
import enemyIcon from '@public/assets/icons/enemyIcon.png'
import wishIcon from '@public/assets/icons/wish.png'
import partyIcon from '@public/assets/icons/party.png'
/**
 * Side navigation component
 */
export default function Sidenav() {
  const pathname = usePathname() //get path url
  const { sideNavCollapsed, setSideNavCollapsed } = NavigationStore() //get sidenav state
  const [activePage, setActivePage] = useState('') //keep track of active page
  const [windowWidth, setWindowWidth] = useState(1201) //keep track of window width
  const { togglePalette } = SearchStore() //get search pallette state

  useEffect(() => setActivePage(pathname), [pathname]) //update active page on path change
  useEffect(() => setWindowWidth(window.innerWidth), []) //update window width on load

  //handle sidenav state based on window width
  useEffect(() => { 
    const handleResize = () => setSideNavCollapsed(true)
    handleResize()
    window.addEventListener('resize', handleResize)
  }, [setSideNavCollapsed])

  /**
   * Side navigation button component
   * @param props 
   * @returns 
   */
  function SideNavLink(props: {href?: string, text: string, img?: any, icon?: any, onClick?: () => void}) {
    const handleSideNavLinkClick = (href: string) => { 
      if(props.onClick !== undefined){
        props.onClick()
        return
      }
      setActivePage(href)
      if(window.innerWidth < 1200) 
        setSideNavCollapsed(true)
    }
    const onLinkedPage: boolean =  props.href === "/" ? activePage === "/" : activePage.includes(props.href)
    return (
      <Link 
        href={props.href} 
        className={SidenavCSS.sidenavLink +' '+ (onLinkedPage && SidenavCSS.active) + (!sideNavCollapsed ? ' waves-effect waves-light ripple ' : ' ')}
        onClick={() => handleSideNavLinkClick(props.href)}  
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
        {/* <SideNavLink href="#" icon="search" text="Search" onClick={togglePalette}/> */}
        <SideNavLink href="/characters" img={characterIcon} text="Characters"/>
        <SideNavLink href="/weapons" img={weaponIcon} text="Weapons"/>
        <SideNavLink href="/artifacts" img={artifactIcon} text="Artifacts"/>
        {/* <SideNavLink href="/enemies" img={enemyIcon} text="Enemies"/>
        <SideNavLink href="/wishes" img={wishIcon} text="Banners"/> */}
        <SideNavLink href="/articles" img={wishIcon} text="Articles"/>
        <SideNavLink href="/teams" img={partyIcon} text="Teams"/>


      </nav>
      {!sideNavCollapsed && windowWidth < 1500 && 
        <Overlay zIndex={2} onClick={() => setSideNavCollapsed(true)}></Overlay>
      }
    </>
  )
}