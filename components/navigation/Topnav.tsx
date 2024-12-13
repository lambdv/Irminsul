'use client'

import Link from "next/link";
import Image from "next/image";
import React, { use, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import TopnavCSS from "./topnav.module.css"
import SearchPallette from "@/components/navigation/SearchPallette";
import { SearchStore } from "@/store/Search";
import { NavigationStore } from "@/store/Navigation";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function Topnav() {
  const { SearchQuery, updateQuery } = SearchStore();
  const pathname = usePathname();
  const showPallette = () => {
    return (!pathname.includes("characters") && SearchQuery.replace(" ", "") !== "");
  };

  const { toggleSideNavCollapsed } = NavigationStore();
  const [atTop, setAtTop] = useState(true);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     const content = document.getElementById("content") as HTMLElement;      
  //     if (content.scrollTop > 0)
  //       setAtTop(false);
  //     else
  //       setAtTop(true);
  //   }
    
  //   handleScroll();
  //   window.addEventListener("scroll", handleScroll);
  // }, []);

  return (
    <nav className={TopnavCSS.topnav + ' '+ (!atTop ? TopnavCSS.solidnav : '')}>

      <div id="topnavLeft" className={TopnavCSS.hamburger}>
        <button className={TopnavCSS.hamburgerBtn + ' waves-effect waves-light ripple '} onClick={ toggleSideNavCollapsed }>
          <i className="material-symbols-outlined" >menu</i>
        </button>
        <Link href="/">
          <p id={TopnavCSS.logo}>Irminsul</p>
        </Link>

        <div className="flex relative top-3 left-4">
          {/* <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/characters">Characters</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb> */}
        </div>
      
      </div>
      <div id="topnavCenter" className={TopnavCSS.searchContainer}>
          <input 
            className={TopnavCSS.searchBar} 
            style={{ userSelect: "none" }} 
            placeholder="Search" 
            value={SearchQuery}
            onChange={updateQuery}
          />
          {/*showPallette && <SearchPallette/>*/}
      </div>
      <div id="topnavRight" className={TopnavCSS.fries + " " + TopnavCSS.hamburger}>
        <button className={TopnavCSS.hamburgerBtn + ' waves-effect waves-light ripple '}>
          <i className="material-symbols-outlined">account_circle</i>
        </button>
      </div>
    </nav>
  )
}