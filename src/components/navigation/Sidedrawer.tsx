"use client"
import React, { useState, useEffect } from 'react';

import { NavigationStore } from '@/store/Navigation';
import Overlay from '../ui/Overlay';
import SidenavCSS from './sidenav.module.css'
import { getCDNURL } from '@/utils/getAssetURL'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { links } from './Siderail';
import TopnavCSS from './topnav.module.css'
import {auth, signIn, signOut} from "@/app/(auth)/auth";

const CHARACTER_ICON = getCDNURL("imgs/icons/characterIcon.png")
const WEAPON_ICON = getCDNURL("imgs/icons/weaponIcon.png")
const ARTIFACT_ICON = getCDNURL("imgs/icons/artifactIcon.png")

export default function Sidedrawer() {



    const { sideNavCollapsed, setSideNavCollapsed } = NavigationStore() //get sidenav state

    const pathname = usePathname() 
    const [activePage, setActivePage] = useState('')
    
    useEffect(() => {
        // Moved useEffect to ensure hooks are called in the same order
        setActivePage(pathname);

        //add css to topnav
    }, [pathname]); 


    const handleCloseDrawer = () => {
        //add css (animation: slideOut 0.2s forwards;) to the sidenav
        document.querySelector(`.${SidenavCSS.sidenav}`)?.classList.add(SidenavCSS.sidenavCollapsing);
        // //wait for the animation to finish before setting the state 
        setTimeout(() => {
            setSideNavCollapsed(true)
        }, 150);
    }


    function SideNavLink(props: {
        href?: string, 
        text: string, 
        img?: any, 
        icon?: any, 
        onClick?: () => void,
    }) {
        const handleSideNavLinkClick = (href: string) => { 
            if(props.onClick !== undefined){
                props.onClick()
                return
            }
            setActivePage(href)
            handleCloseDrawer()
        }
        const onLinkedPage: boolean =  props.href === "/" ? activePage === "/" : activePage.includes(props.href)
        return (
            <Link 
                href={props.href} 
                className={
                    SidenavCSS.sidenavLink + ' '  
                    + (onLinkedPage && SidenavCSS.active)
                    + " waves-effect waves-light ripple "
                }
                onClick={() => handleSideNavLinkClick(props.href)}
            >
                <i className={SidenavCSS.sidenavLinkSymbol + ' material-symbols-rounded'}>
                    {props.img ? <Image src={props.img} alt={props.text} width={24} height={24} unoptimized={false}/> : props.icon}
                </i>
                {props.text !== "" && <p>{props.text}</p> }
            </Link>
        )
    }

    
    return (
        sideNavCollapsed ? <></> :
            <Overlay
                zIndex={3}
                onClick={handleCloseDrawer}
                style={{ top: "60px"}}
            >
                <div className={`${SidenavCSS.sidenav}`} >
                    {links.map((link, index) => (
                        <SideNavLink key={index} {...link} />
                    ))}
                </div>



            </Overlay>
    )
}
