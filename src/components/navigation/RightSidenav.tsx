'use client'
import RightSidenavCSS from '@/components/navigation/rightsidenav.module.css'

/**
 * Sidebar on the right side for 
 * @returns 
 */
export default function RightSidenav(props) {
  return (
      <nav 
        className={
          RightSidenavCSS.rightsidenav + " " + 
          props.className
        } 
      >
        {props.children}
      </nav>
  )
}