'use client'
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import TopnavCSS from "./topnav.module.css"
import SearchPallette from "@components/navigation/SearchPallete"
import { SearchStore } from "@/store/Search"
import { NavigationStore } from "@/store/Navigation"
import Overlay from "../ui/Overlay"
import Btn from "@/components/ui/Btn"
import { getSession, signIn, signOut, useSession } from "next-auth/react"
import { auth } from "@/app/(auth)/auth"
import Image from "next/image"
import RoundBtn from "../ui/RoundBtn"
/**
 * Top navigation bar component
 * @note displayed at the top of every page
 * @note contains the search bar, logo, and hamburger menu for toggling the side navigation bar collapsed state
 */
export default function Topnav() {
  const { showPallette, setShowPallette } = SearchStore()

  const [isAtTop, setIsAtTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsAtTop(window.scrollY === 0);
    handleScroll()
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [])

  return (
    <>
      <nav className={TopnavCSS.topnav + " " + (!isAtTop && TopnavCSS.solidnav)}>
        <LeftContainer/>
        <CenterContainer showPallette={showPallette} setShowPallette={setShowPallette}/>
        <RightContainer/>
      </nav>

      {showPallette &&
        <Overlay 
          zIndex={100} 
          onClick={()=>setShowPallette(false)} 
          style={{ display: showPallette ? 'block' : 'none' }}
        >
          <SearchPallette/>
        </Overlay>
      }
    </>
  )
}

/**
 * Center container of the topnav
 * @note contains the search bar and search pallette
 */
function CenterContainer(props: any){
  const { showPallette, setShowPallette } = props
  const { SearchQuery, updateQuery, setFirstKeyPress, firstKeyPress } = SearchStore()
  const pathname = usePathname()

  const isExplorePage = () => {
    return pathname === "/archive/characters" || pathname === "/archive/weapons" || pathname === "/archive/artifacts" || pathname === "/articles/team-dps"
  }

  const openSearchPallette = (e) => {
    if(!isExplorePage() && !showPallette && SearchQuery !== "" && SearchQuery !== undefined){
      if(firstKeyPress && SearchQuery.length > 1){
        setFirstKeyPress(false)
      }
      setShowPallette(!showPallette)
     
    }
  }

  const handleSearchBarChange = (e) => {
    if(e.target.selectionStart !== 0 && !isExplorePage()){
      setShowPallette(!showPallette)
      updateQuery(e)
    }

    if(isExplorePage()) 
      updateQuery(e)
  }

  return (
    <div id="topnavCenter" className={TopnavCSS.searchContainer}>
        <input 
          className={TopnavCSS.searchBar} 
          placeholder="Search" 
          value={SearchQuery}
          onChange={handleSearchBarChange}
          onMouseDown={openSearchPallette}
        />
    </div>
  )
}

function LeftContainer(){
  const { toggleSideNavCollapsed } = NavigationStore()
  const websiteName = "Irminsul"
  
  return (
    <div id="topnavLeft" className={TopnavCSS.hamburger}>
      {/* <button className={TopnavCSS.hamburgerBtn + ' waves-effect waves-light ripple '} onClick={ toggleSideNavCollapsed }>
        <i className="material-symbols-outlined" >menu</i>
      </button> */}
      <RoundBtn 
        icon="menu"
        onClick={toggleSideNavCollapsed}
        className={TopnavCSS.hamburgerBtn}
      />
        
      <Link href="/">
        <p id={TopnavCSS.logo}>{websiteName} <span>Beta</span></p>
      </Link>
    </div>
  )
}

 function RightContainer(){

    const [session, setSession] = useState(null)

    useEffect(() => {
      const fetchSession = async () => {
        const session = await getSession()
        setSession(session)
      }
      fetchSession()
    }, [])

    const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div id="topnavRight" className={TopnavCSS.fries + " " + TopnavCSS.hamburger}>

      <div className={TopnavCSS.mobileOnly}>
        {/* <button 
              className={TopnavCSS.mobileOnly + " " + TopnavCSS.hamburgerBtn + ' waves-effect waves-light ripple '}
              onClick={() => SearchStore.getState().setShowPallette(true)}
            >
          <i className="material-symbols-outlined">search</i>
        </button> */}
        <RoundBtn 
          icon="search"
          onClick={() => SearchStore.getState().setShowPallette(true)}
          className={TopnavCSS.hamburgerBtn}
        />
      </div>

      <div className={TopnavCSS.userDropdownContainer}>
        {session?.user ?
          <>
              <div className="relative">
                <button onClick={() => setShowDropdown(!showDropdown)}>
                  <Image 
                    src={session?.user?.image} 
                    alt="User Avatar" 
                    className={TopnavCSS.userAvatar}
                    width={40}
                    height={40}
                    unoptimized
                  />
                </button>
                <div 
                  className={showDropdown ? TopnavCSS.dropdownMenu : TopnavCSS.dropdownMenuHidden}
                >
                  <Link href="/settings" onClick={() => setShowDropdown(false)} className={TopnavCSS.dropdownMenuItem}>
                      <div className={TopnavCSS.dropdownMenuItemContent}>
                        <span className={`material-symbols-rounded ${TopnavCSS.dropdownMenuIcon}`}>settings</span>
                        Settings
                      </div>
                  </Link>

                  <button onClick={() => signOut()} className={TopnavCSS.dropdownMenuItem}>
                    <div className={TopnavCSS.dropdownMenuItemContent}>
                      <span className={`material-symbols-rounded ${TopnavCSS.dropdownMenuIcon}`}>logout</span>
                      Sign out
                    </div>
                  </button>
                </div>
                {showDropdown && (
                  <div 
                    className={TopnavCSS.dropdownOverlay}
                    onClick={() => setShowDropdown(false)}
                  />
                )}
              </div>
          </>
          :
          <Link href="/login">
            <Btn>Log In</Btn>
          </Link>
        }
      </div>
    </div>
  )
}
