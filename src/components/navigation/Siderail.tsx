"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import SidenavCSS from "./sidenav.module.css"
import { NavigationStore } from "@/store/Navigation"
import { getCDNURL } from "@/utils/getAssetURL"

const CHARACTER_ICON = getCDNURL("imgs/icons/characterIcon.png")
const WEAPON_ICON = getCDNURL("imgs/icons/weaponIcon.png")
const ARTIFACT_ICON = getCDNURL("imgs/icons/artifactIcon.png")

type SideRailLink = {
  href: string
  text: string
  img?: string
  icon?: string
  external?: boolean
  archiveParent?: boolean
}

export const archiveChildLinks: SideRailLink[] = [
  { href: "/archive/characters", img: CHARACTER_ICON, text: "Characters" },
  { href: "/archive/weapons", img: WEAPON_ICON, text: "Weapons" },
  { href: "/archive/artifacts", img: ARTIFACT_ICON, text: "Artifacts" },
]

export const primaryLinks: SideRailLink[] = [
  {
    href: "/",
    icon: "chat_bubble",
    text: "Ask AI",
  },
  {
    href: "/archive/characters",
    icon: "database",
    text: "Archive",
    archiveParent: true,
  },
  {
    href: "https://aminus.irminsul.moe/",
    icon: "functions",
    text: "Calculator",
    external: true,
  },
  { href: "/pricing", icon: "shopping_cart", text: "Pricing" },
  { href: "/settings", icon: "settings", text: "Settings" },
]

// Backwards-compatible export for older navigation consumers.
export const links = primaryLinks

/**
 * Side navigation component
 */
export default function Siderail() {
  const pathname = usePathname()
  const { sideNavCollapsed, setSideNavCollapsed } = NavigationStore()
  const isExpanded = !sideNavCollapsed
  const isArchiveRoute = pathname.startsWith("/archive/")

  const isLinkActive = (href?: string, archiveParent?: boolean) => {
    if (!href) return false
    if (archiveParent) return isArchiveRoute
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  function SideNavLink(props: {
    href?: string
    text: string
    img?: string
    icon?: string
    archiveParent?: boolean
    child?: boolean
    external?: boolean
  }) {
    const onLinkedPage = isLinkActive(props.href, props.archiveParent)

    if (props.external && props.href) {
      return (
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          className={SidenavCSS.sidenavLink}
          onClick={() => setSideNavCollapsed(true)}
        >
          <i
            className={
              SidenavCSS.sidenavLinkSymbol + " material-symbols-rounded"
            }
          >
            {props.img ? (
              <Image
                src={props.img}
                alt={props.text}
                width={24}
                height={24}
                unoptimized={true}
              />
            ) : (
              props.icon
            )}
          </i>
          {props.text !== "" && <p>{props.text}</p>}
        </a>
      )
    }

    return (
      <Link
        href={props.href || "#"}
        className={
          SidenavCSS.sidenavLink +
          " " +
          (props.child ? SidenavCSS.archiveChildLink : "") +
          " " +
          (onLinkedPage ? SidenavCSS.active : "")
        }
        onClick={() => setSideNavCollapsed(true)}
      >
        <i
          className={SidenavCSS.sidenavLinkSymbol + " material-symbols-rounded"}
        >
          {props.img ? (
            <Image
              src={props.img}
              alt={props.text}
              width={24}
              height={24}
              unoptimized={true}
            />
          ) : (
            props.icon
          )}
        </i>
        {props.text !== "" && <p>{props.text}</p>}
      </Link>
    )
  }

  return (
    <nav
      className={
        SidenavCSS.sidenav +
        " " +
        (sideNavCollapsed ? SidenavCSS.sidenavCollapsed : "")
      }
    >
      {primaryLinks.map((link, index) => (
        <div key={index}>
          <SideNavLink {...link} />
          {isExpanded &&
            link.archiveParent &&
            archiveChildLinks.map((archiveLink, childIndex) => (
              <SideNavLink key={childIndex} {...archiveLink} child={true} />
            ))}
        </div>
      ))}
    </nav>
  )
}
