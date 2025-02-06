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
      <button className={TopnavCSS.hamburgerBtn + ' waves-effect waves-light ripple '} onClick={ toggleSideNavCollapsed }>
        <i className="material-symbols-outlined" >menu</i>
      </button>
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
        <button 
              className={TopnavCSS.mobileOnly + " " + TopnavCSS.hamburgerBtn + ' waves-effect waves-light ripple '}
              onClick={() => SearchStore.getState().setShowPallette(true)}
            >
          <i className="material-symbols-outlined">search</i>
        </button>
      </div>

      <div style={{marginTop: "5px", marginLeft: "8px"}}>
        {session?.user ?
          <>
              <div className="relative">
                <button onClick={() => setShowDropdown(!showDropdown)}>
                  <Image 
                    src={session?.user?.image} 
                    alt="User Avatar" 
                    className="w-10 h-10 rounded-full p-0 cursor-pointer"
                    width={40}
                    height={40}
                    unoptimized
                  />
                </button>
                <div 
                  className={`absolute right-0 mt-2 w-48 bg-[#0e0e0e] rounded-md shadow-lg py-1 transition-all duration-200 ease-in-out transform origin-top z-10 ${
                    showDropdown ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
                  }`}
                >
                  <Link href="/settings" onClick={() => setShowDropdown(false)} className="block w-full text-left px-4 py-2 text-sm hover:bg-[#4747477c]">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-rounded" style={{fontSize: "16px"}}>settings</span>
                        Settings
                      </div>
                  </Link>

                  <button onClick={() => signOut()} className="block w-full text-left px-4 py-2 text-sm hover:bg-[#4747477c]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-rounded" style={{fontSize: "16px"}}>logout</span>
                      Sign out
                    </div>
                  </button>
                </div>
                {showDropdown && (
                  <div 
                    className="fixed inset-0 z-[-1]"
                    style={{zIndex: "2", 
                      //backgroundColor: "rgba(0, 0, 0, 0.5)"
                    }}
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
