'use client'

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";

import TopnavCSS from "@/css/topnav.module.css"
import RoundBtn from "@/components/ui/RoundBtn";
import SearchPallette from "@/components/navigation/SearchPallette";

export default function Topnav() {

  const toggleMenu = () => {
    alert("toggle menu")
  }

  const [query, setQuery] = useState("");
  const updateQuery = (e) => setQuery(e.target.value);

  const pathname = usePathname();

  const isNotExplorePage = () =>{
    return (pathname !== "/characters") //return true if not on explore page
  }

  const showPallette = () =>{
    return (query.length > 0 && isNotExplorePage() === true)
  }

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
            value={query}
            onChange={updateQuery}
          />

          {
            showPallette() && <SearchPallette/>
          }
          
      </div>

      <div className={TopnavCSS.hamburger}> </div>
    </nav>
  )
}
