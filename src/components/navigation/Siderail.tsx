"use client"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import Image from "next/image"
import { useEffect, useState } from "react"
import SidenavCSS from "./sidenav.module.css"
import { NavigationStore } from "@/store/Navigation"
import { SearchStore } from "@/store/Search"
import Overlay from '../ui/Overlay'
import { getCDNURL } from '@/utils/getAssetURL'
// No longer needed - using session cache instead

const CHARACTER_ICON = getCDNURL("imgs/icons/characterIcon.png")
const WEAPON_ICON = getCDNURL("imgs/icons/weaponIcon.png")
const ARTIFACT_ICON = getCDNURL("imgs/icons/artifactIcon.png")
const SEELIE_ICON = getCDNURL("imgs/icons/seelie.png")
// const ENEMY_ICON = getCDNURL("imgs/icons/enemyIcon.png")
// const WISH_ICON = getCDNURL("imgs/icons/wish.png")
// const PARTY_ICON = getCDNURL("imgs/icons/party.png")

export let links = [
  {href: "/", icon: "home", text: "Home"},
  {href: "/seelie", 
    //icon: "stars_2", 
    img: SEELIE_ICON,
    text: "Ask AI"},


  {href: "https://aminus.irminsul.moe/", icon: "functions", text: "Damage Calculator"},
  // {href: "/akademiya", icon: "school", text: "Akademiya"},
  // {href: "/calculator", icon: "automation", text: "Calculator"},
  // {href: "/dmgcalc", icon: "functions", text: "DMG Calc"},
  // {href: "/energycalc", icon: "bolt", text: "Energy Calc"},

  {href: "/archive/characters", img: CHARACTER_ICON, text: "CharacterDB"},
  {href: "/archive/weapons", img: WEAPON_ICON, text: "WeaponDB"},
  {href: "/archive/artifacts", img: ARTIFACT_ICON, text: "ArtifactDB"},

  {href: "/articles", icon: "article", text: "Articles"},
  {href: "/support", icon: "favorite", text: "Support"},
  {href: "/settings", icon: "settings", text: "Settings"},
]

/**
 * Side navigation component
 */
export default function Siderail() {
  const pathname = usePathname() //get path url
  const [activePage, setActivePage] = useState('') //keep track of active page
  useEffect(() => setActivePage(pathname), [pathname]) //update active page on path change

  // const {setShowPallette} = SearchStore()
  // const [session, setSession] = useState(null)
  // useEffect(() => {
  //   const fetchSession = async () => {
  //     const session = await getSession()
  //     setSession(session)
  //   }
  //   fetchSession()
  // }, [])

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
        href={props.href || "#"} 
        className={
          SidenavCSS.sidenavLink + ' '  
          + (onLinkedPage && SidenavCSS.active)  
          // +(!sideNavCollapsed ? ' waves-effect waves-light ripple ' : ' ')
        }
        onClick={() => handleSideNavLinkClick(props.href)}
      >
        <i className={SidenavCSS.sidenavLinkSymbol + ' material-symbols-rounded'}>

          {props.img ? <Image src={props.img} alt = {props.text} width={24} height={24} unoptimized={true}/> : props.icon}
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



