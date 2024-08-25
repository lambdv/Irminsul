'use client'

import Link from "next/link";
import Image from "next/image";
import React, { use, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import TopnavCSS from "./topnav.module.css"
import SearchPallette from "@/components/navigation/SearchPallette";
import { SearchStore } from "@/store/Search";
import { NavigationStore } from "@/store/Navigation";


export default function Topnav() {
  const { SearchQuery, updateQuery } = SearchStore();
  const pathname = usePathname();
  const showPallette = () => {
    return (!pathname.includes("characters") && SearchQuery.replace(" ", "") !== "");
  };

  const { toggleSideNavCollapsed } = NavigationStore();
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      //get div with id content
      
      const content = document.getElementById("content") as HTMLElement;


      
      if (content.scrollTop > 0)
        setAtTop(false);
      else
        setAtTop(true);
    }
    
    handleScroll();
    window.addEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={TopnavCSS.topnav + ' '+ (!atTop ? TopnavCSS.solidnav : '')}>

      <div className={TopnavCSS.hamburger}>
        <button className={TopnavCSS.hamburgerBtn + ' waves-effect waves-light ripple '} onClick={ toggleSideNavCollapsed }>
          <i className="material-symbols-outlined" >menu</i>
        </button>
        <Link href="/">
          <p id={TopnavCSS.logo}>Irminsul</p>
        </Link>
      </div>
      <div className={TopnavCSS.searchContainer}>
          <input 
            className={TopnavCSS.searchBar} 
            style={{ userSelect: "none" }} 
            placeholder="Search" 
            value={SearchQuery}
            onChange={updateQuery}
          />
          {/*showPallette && <SearchPallette/>*/}
      </div>
      <div className={TopnavCSS.hamburger}> </div>
    </nav>
  )
}