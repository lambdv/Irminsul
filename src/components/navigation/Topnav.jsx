'use client'

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";

import TopnavCSS from "@/css/topnav.module.css"
import RoundBtn from "@/components/ui/RoundBtn";
import SearchPallette from "@/components/navigation/SearchPallette";

import { SearchStore } from "@/store/Search";

export default function Topnav() {

  const toggleMenu = () => {
    alert("toggle menu")
  }

  const { SearchQuery, updateQuery } = SearchStore();

  const pathname = usePathname();


  const showPallette = () => {

    return (!usePathname().includes("characters") && SearchQuery.replace(" ", "") !== "");
  };

  return (
    <nav className={TopnavCSS.topnav}>
      <div className={TopnavCSS.hamburger}>
        <RoundBtn icon="menu" onClick={toggleMenu}/>
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

          {/* { 
            showPallette && <SearchPallette/> 
          } */}
          
      </div>

      <div className={TopnavCSS.hamburger}> </div>
    </nav>
  )
}
