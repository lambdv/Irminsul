'use client'
import Link from "next/link";
import Image from "next/image";
import React, { use, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import TopnavCSS from "./topnav.module.css"
import SearchPallette from "@/components/navigation/SearchResults";
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
import Modal from "../ui/Modal";

/**
 * Top navigation bar component
 * @note displayed at the top of every page
 * @note contains the search bar, logo, and hamburger menu for toggling the side navigation bar collapsed state
 */
export default function Topnav() {
  return (
    <nav className={TopnavCSS.topnav}>
      <LeftContainer/>
      <CenterContainer/>
      <RightContainer/>
    </nav>
  )
}

/**
 * Center container of the topnav
 * @note contains the search bar and search pallette
 */
function CenterContainer(){
  const { SearchQuery, updateQuery } = SearchStore()
  const pathname = usePathname();

  const isExplorePage = () => pathname === "/characters" || pathname === "/weapons" || pathname === "/artifacts";

  return (
    <div id="topnavCenter" className={TopnavCSS.searchContainer}>
        <input 
          className={TopnavCSS.searchBar} 
          placeholder="Search" 
          value={SearchQuery}
          onChange={updateQuery}
          onClick={e => console.log(e)}
        />

        {/* <Modal>
          <p>asd</p>
        </Modal> */}
    </div>
  )
}

/**
 * Left container of the topnav
 * @note contains the logo, hamburger menu and breadcrumbs
 */
function LeftContainer(){
  const { toggleSideNavCollapsed } = NavigationStore();
  return (
    <div id="topnavLeft" className={TopnavCSS.hamburger}>
      <button className={TopnavCSS.hamburgerBtn + ' waves-effect waves-light ripple '} onClick={ toggleSideNavCollapsed }>
        <i className="material-symbols-outlined" >menu</i>
      </button>
      <Link href="/">
        <p id={TopnavCSS.logo}>Irminsul</p>
      </Link>

      {/* <div className="flex relative top-3 left-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/characters">Characters</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div> */}
    </div>
  )
}

/**
 * Right container of the topnav
 * @note contains the user account icon
 */
function RightContainer(){
  return (
    <div id="topnavRight" className={TopnavCSS.fries + " " + TopnavCSS.hamburger}>
      <button className={TopnavCSS.hamburgerBtn + ' waves-effect waves-light ripple '}>
        <i className="material-symbols-outlined">dark_mode</i>
      </button>

      <button className={TopnavCSS.hamburgerBtn + ' waves-effect waves-light ripple '}>
        <i className="material-symbols-outlined">account_circle</i>
      </button>
    </div>
  )
}
