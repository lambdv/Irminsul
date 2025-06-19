'use client'
import styles from './bottomnav.module.css'
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { SearchStore } from '@/store/Search';
import { NavigationStore } from '@/store/Navigation';
import Link from 'next/link';
import Image from 'next/image';
import SeelieIcon from '@public/imgs/icons/seelie.png'


export default function BottomNav() {
    const router = useRouter();
    //pathname for client component
    const pathname = usePathname();
    const { showPallette, togglePalette } = SearchStore();
    const { sideNavCollapsed, toggleSideNavCollapsed } = NavigationStore();

    return (
        <div className={styles.bottomnav}>
            <div className={styles.bottomnavWrapper}>
                
                <Link href={"/"} className={styles.bottomnavButton + " waves-effect waves-light ripple "
                    + (pathname === "/" && styles.active)
                }>
                    <i className="material-symbols-rounded">home</i>
                </Link>

                <Link href={"/seelie"} className={styles.bottomnavButton + " waves-effect waves-light ripple "
                    + (pathname === "/seelie" && styles.active)
                }>
                    <i className="material-symbols-rounded">forum</i>
                    </Link>


                <a className={styles.bottomnavButton + " waves-effect waves-light ripple "} onClick={togglePalette}>
                    <i className="material-symbols-rounded">search</i>
                </a>

                <button className={styles.bottomnavButton + " waves-effect waves-light ripple "} onClick={toggleSideNavCollapsed}>
                    <i className="material-symbols-rounded">menu</i>
                </button>

            </div>
        </div>
    )
}


