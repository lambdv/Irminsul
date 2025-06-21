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
  const { sideNavCollapsed, setSideNavCollapsed } = NavigationStore()

  const [isAtTop, setIsAtTop] = useState(false)

  const [prevIsAtTop, setPrevIsAtTop] = useState(true)

  useEffect(() => {
    const handleScroll = () => setIsAtTop(window.scrollY === 0);
    handleScroll()
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [])

  useEffect(() => {
    if(!sideNavCollapsed){
      setPrevIsAtTop(isAtTop)
      setIsAtTop(false)
    }

    else{
        setIsAtTop(prevIsAtTop)
        setPrevIsAtTop(isAtTop)
    }

  }, [sideNavCollapsed])

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


function LeftContainer(){
  const { toggleSideNavCollapsed } = NavigationStore()
  const websiteName = "Irminsul"
  const pathname = usePathname()
  
  return (
    <div id="topnavLeft" className={TopnavCSS.topnavLeft + " " + TopnavCSS.hamburger}>
      <div className={TopnavCSS.hamburgerContainer}>
        <RoundBtn 
          icon="menu"
          onClick={toggleSideNavCollapsed}
          className={TopnavCSS.hamburgerBtn}
        />
          
        <Link href="/">
          <p id={TopnavCSS.logo}>
            {websiteName} <span>Beta</span>
          </p>
        </Link>
      </div>
      
      <div className={TopnavCSS.breadcrumbContainer}>
        {pathname === "/" && 
          <>
            <i className="material-symbols-outlined" style={{fontSize: "13px", color: "var(--gray-text-color)"}}>chevron_right</i>
            <Breadcrumb href={pathname} isHighlighted={true} text="Home" />
          </>
        }
        {pathname !== "/" && pathname.split("/")
          .map((path, index) => {
            if(index === 0) return null
            if(path === "archive") return null
            return (
              <React.Fragment key={index}>
                <i className="material-symbols-outlined" style={{fontSize: "13px", color: "var(--gray-text-color)"}}>chevron_right</i>
                <Breadcrumb 
                  href={pathname.split("/").slice(0, index + 1).join("/")} 
                  isHighlighted={index === pathname.split("/").length - 1} 
                  text={path} />
                {/* {index < pathname.split("/").length - 1 && <i className="material-symbols-outlined" style={{fontSize: "13px", color: "var(--gray-text-color)"}}>chevron_right</i>} */}
              </React.Fragment>
            )
        })}
      </div>


    </div>
  )
}


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
          placeholder="Search (ctrl+k)" 
          value={SearchQuery}
          onChange={handleSearchBarChange}
          onMouseDown={openSearchPallette}
        />
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

        <RoundBtn 
          icon="search"
          onClick={() => SearchStore.getState().setShowPallette(true)}
          className={TopnavCSS.hamburgerBtn}
          style={{ top: "5px" }}
        />
      </div>

      <div className={TopnavCSS.userDropdownContainer}>
        {session?.user && (
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
          
        )}

        {!session?.user && (
          <Link href="/login">
            <Btn>Log In</Btn>
          </Link>
        )}
      </div>
    </div>
  )
}

function Breadcrumb(props: {
  href: string,
  text: string,
  isHighlighted?: boolean,
  key?: any
}){
  const maxLength = 15
  return (
    <Link href={props.href} key={props.key} style={{
      padding: "0px",
      margin: "0px",
    }}>
        <p className={TopnavCSS.breadcrumb + " " + (props.isHighlighted && TopnavCSS.highlightedBreadcrumb)}>
          {props.text.length > maxLength ? props.text.slice(0, maxLength) + "..." : props.text}
      </p>
    </Link>

  )
}