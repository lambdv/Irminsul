'use client'

import Link from "next/link";
import Image from "next/image";

 import TopnavCSS from "../../css/topnav.module.css"



export default function Topnav() {

  return (
    <nav className={TopnavCSS.topnav}>
      <p id={TopnavCSS.logo}>Irminsul</p>
      <div className={TopnavCSS.searchContainer}>
          <input className={TopnavCSS.searchBar} style={{ userSelect: "none" }} placeholder="Search"/>
      </div>
    </nav>
  )
}
