"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { NavigationStore } from "@/store/Navigation"
import SidenavCSS from "./sidenav.module.css"
import { archiveChildLinks } from "./Siderail"

export default function ArchiveSecondarySidenav() {
  const pathname = usePathname()
  const { sideNavCollapsed } = NavigationStore()

  const isArchiveRoute = pathname.startsWith("/archive/")
  const showArchiveSecondaryNav = sideNavCollapsed && isArchiveRoute

  useEffect(() => {
    if (!showArchiveSecondaryNav) {
      document.body.removeAttribute("data-archive-secondary-open")
      return
    }

    document.body.setAttribute("data-archive-secondary-open", "true")

    return () => {
      document.body.removeAttribute("data-archive-secondary-open")
    }
  }, [showArchiveSecondaryNav])

  if (!showArchiveSecondaryNav) {
    return null
  }

  return (
    <nav className={SidenavCSS.archiveSecondarySidenav}>
      {archiveChildLinks.map((link, index) => {
        const isActive = pathname.startsWith(link.href)
        return (
          <Link
            key={index}
            href={link.href}
            className={
              SidenavCSS.archiveSecondaryLink + " " + (isActive ? SidenavCSS.active : "")
            }
          >
            <i
              className={SidenavCSS.sidenavLinkSymbol + " material-symbols-rounded"}
            >
              {link.img ? (
                <Image
                  src={link.img}
                  alt={link.text}
                  width={24}
                  height={24}
                  unoptimized={true}
                />
              ) : (
                link.icon
              )}
            </i>
            <p>{link.text}</p>
          </Link>
        )
      })}
    </nav>
  )
}
