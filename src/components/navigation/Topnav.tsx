'use client'
import Link from "next/link"
import React, { use, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import TopnavCSS from "./topnav.module.css"
import SearchPallette from "@components/navigation/SearchPallete"
import { SearchStore } from "@/store/Search"
import { NavigationStore } from "@/store/Navigation"
import Overlay from "../ui/Overlay"

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
  const { SearchQuery, updateQuery } = SearchStore()
  const pathname = usePathname()

  const isExplorePage = () => { 
    return pathname === "/characters" || pathname === "/weapons" || pathname === "/artifacts"
  }

  const openSearchPallette = (e) => {
    if(!isExplorePage() && !showPallette && SearchQuery !== "" && SearchQuery !== undefined)
      setShowPallette(!showPallette)
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
  return (
    <div id="topnavLeft" className={TopnavCSS.hamburger}>
      <button className={TopnavCSS.hamburgerBtn + ' waves-effect waves-light ripple '} onClick={ toggleSideNavCollapsed }>
        <i className="material-symbols-outlined" >menu</i>
      </button>
      <Link href="/">
        <p id={TopnavCSS.logo}>Irminsul</p>
      </Link>
    </div>
  )
}

function RightContainer(){
  const toggleTheme = () => {}

  return (
    <div id="topnavRight" className={TopnavCSS.fries + " " + TopnavCSS.hamburger}>
      <button 
            className={TopnavCSS.hamburgerBtn + ' waves-effect waves-light ripple ' + TopnavCSS.mobileFries}
            onClick={() => SearchStore.getState().setShowPallette(true)}
          >
        <i className="material-symbols-outlined">search</i>
      </button>

      <button className={TopnavCSS.hamburgerBtn + ' waves-effect waves-light ripple '}
        onClick={toggleTheme}
      >
        <i className="material-symbols-outlined">dark_mode</i>
      </button>
      <button className={TopnavCSS.hamburgerBtn + ' waves-effect waves-light ripple '}>
        <i className="material-symbols-outlined">account_circle</i>
      </button>
    </div>

  )
}
