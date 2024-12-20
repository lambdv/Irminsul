'use client'
import { usePathname } from 'next/navigation'
import {useEffect, useState } from "react";
import RightSidenavCSS from '@/components/navigation/rightsidenav.module.css'


/**
 * Sidebar on the right side for 
 * @returns 
 */
export default function RightSidenav(props) {
  const pathname = usePathname(); //get url path
  const [sideNavCollapsed, setSideNavCollapsed] = useState(true); // use state instead of store

  useEffect(() => { //handle sidenav state based on window width
    const handleSidenavState = () => setSideNavCollapsed(window.innerWidth < 1200);
    handleSidenavState();
    window.addEventListener('resize', handleSidenavState);
  }, []);

  return (
      <nav 
        className={
          RightSidenavCSS.rightsidenav + " " + 
          (sideNavCollapsed && RightSidenavCSS.rightsidenavCollapsed) + " " +
          props.className
        } 
        
      >
        {props.children}
      </nav>
  )
}