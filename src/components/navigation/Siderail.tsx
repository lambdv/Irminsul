"use client"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import Image from "next/image"
import { useEffect, useState } from "react"
import SidenavCSS from "./sidenav.module.css"
import { NavigationStore } from "@/store/Navigation"
import { SearchStore } from "@/store/Search"
import Overlay from '../ui/Overlay'
import characterIcon from '@public/imgs/icons/characterIcon.png'
import weaponIcon from '@public/imgs/icons/weaponIcon.png'
import artifactIcon from '@public/imgs/icons/artifactIcon.png'
import seelieIcon from '@public/imgs/icons/seelie.png'
import enemyIcon from '@public/imgs/icons/enemyIcon.png'
import wishIcon from '@public/imgs/icons/wish.png'
import partyIcon from '@public/imgs/icons/party.png'
import { getSession, signIn, signOut, useSession } from "next-auth/react"





export default function Siderail() {
  const pathname = usePathname() //get path url
  const [activePage, setActivePage] = useState('') //keep track of active page

  const {setShowPallette} = SearchStore()

  // const [session, setSession] = useState(null)

  // useEffect(() => {
  //   const fetchSession = async () => {
  //     const session = await getSession()
  //     setSession(session)
  //   }
  //   fetchSession()
  // }, [])


  useEffect(() => setActivePage(pathname), [pathname]) //update active page on path change


  /**
   * Side navigation button component
   * @param props 
   * @returns 
   */
  function SideNavLink(props: {
    href?: string, 
    text: string, 
    img?: any, 
    icon?: any, 
    onClick?: () => void,
    bottom?: boolean
  }) {
    const handleSideNavLinkClick = (href: string) => { 
      if(props.onClick !== undefined){
        props.onClick()
        return
      }
      setActivePage(href)
      // if(window.innerWidth < 1200) 
      //   setSideNavCollapsed(true)
    }
    const onLinkedPage: boolean =  props.href === "/" ? activePage === "/" : activePage.includes(props.href)
    return (
      <Link 
        href={props.href} 
        className={
          SidenavCSS.sidenavLink + ' '  
          + (onLinkedPage && SidenavCSS.active)  
          // +(!sideNavCollapsed ? ' waves-effect waves-light ripple ' : ' ')
        }
        onClick={() => handleSideNavLinkClick(props.href)}
      >
        <i className={SidenavCSS.sidenavLinkSymbol + ' material-symbols-rounded'}>

          {props.img ? <Image src={props.img} alt = {props.text} width={24} height={24} unoptimized/> : props.icon}
        </i>
        {props.text !== "" && <p>{props.text}</p> }
      </Link>

    )
  }

  return (
      <nav 
        className={
          SidenavCSS.sidenav + " " 
          + SidenavCSS.sidenavCollapsed
          //+ (sideNavCollapsed && SidenavCSS.sidenavCollapsed)
        } 
        style={{zIndex: 1}}
      >
        
        {/* <button style={{
          backgroundColor: "var(--ingame-primary-color)",
          padding: "10px",
          borderRadius: "10px",
          marginBottom: "10px",
          width: "50px",
          height: "45px",
        }}
          onClick={() => {
            setShowPallette(true)
          }}
        >
          <i className={'material-symbols-rounded'} style={{
            fontSize: "20px",
            marginTop: "2.5px",
          }}>search</i>
        </button> */}

        {links.map((link, index) => (
          <SideNavLink key={index} {...link} />
        ))}
      </nav>
  )
}

export let links = [
  {href: "/", icon: "home", text: "Home"},
  // {href: "/seelie", icon: "forum", text: "Ask AI"},
  {href: "/archive/characters", img: characterIcon, text: "Characters"},
  {href: "/archive/weapons", img: weaponIcon, text: "Weapons"},
  {href: "/archive/artifacts", img: artifactIcon, text: "Artifacts"},
  {href: "/articles", icon: "article", text: "Articles"},
  {href: "/support", icon: "favorite", text: "Support"},
  {href: "/settings", icon: "settings", text: "Settings"},
]
