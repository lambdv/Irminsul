"use client"
import Item from '@/components/explore/Item'
import { getAssetURL } from '@/utils/getAssetURL'
import Image from 'next/image'
import styles from '@/app/index.module.css'
// import { Comment } from '@/components/ui/CommentSection'
import Link from 'next/link'
import ServerTimer from '@/components/ui/ServerTimer'
import { format } from 'timeago.js'
import { useEffect, useState } from 'react'

type CommentProps = {
    comment: {
        id: string
        userId: string
        comment: string
        createdAt: Date
    }
    user: {
        id: string
        name: string
        image: string
    }
    owner?: string
    options?: boolean
    onDelete?: () => void
}

function ClockBento() {
    const [time, setTime] = useState(new Date())
    const [serverTime, setServerTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date())
            // Assuming server is in Asia timezone UTC+8
            setServerTime(new Date(new Date().getTime() + (8 * 60 * 60 * 1000)))
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    return (
        <div className={styles.bentoItem}>
            <h2 className={styles.sectionTitle}>Server Time</h2>
            <div className="grid grid-cols-2 gap-4">
                {/* <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center space-y-2">
                            <span className="text-2xl font-bold">
                                {time.toLocaleTimeString()}
                            </span>
                            <span className="text-sm text-gray-500">Local Time</span>
                            <span className="text-xs text-gray-400">
                                {time.toLocaleDateString()}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center space-y-2">
                            <span className="text-2xl font-bold">
                                {serverTime.toLocaleTimeString()}
                            </span>
                            <span className="text-sm text-gray-500">Server Time</span>
                            <span className="text-xs text-gray-400">
                                {serverTime.toLocaleDateString()}
                            </span>
                        </div>
                    </CardContent>
                </Card> */}
            </div>
        </div>
    )
}

export default function HomePageContent({ characters, weapons, artifacts, recentArticles, comments }) {
    return (
        <div id="home-page-container" className={styles.homePageContainer}>
            <div id="bentobox" className={styles.bentoBoxContainer}>
                <PromotionBanner />
                <div className={styles.bentoGrid}>
                    <WishBento />
                    <div className={`${styles.bentoItem} ${styles.changeLogBento}`}>
                        <h2 className={styles.sectionTitle}>Latest Updates</h2>
                        <ChangeLogList />
                    </div>
                    <div className={styles.bentoItem}>
                        <h2 className={styles.sectionTitle}>Recent Articles</h2>
                        <div className={styles.articleList}>
                            {recentArticles.map((article) => (
                                <Link key={article.slug} href={`/articles/${article.slug}`} className={styles.articleLink}>
                                    <div className={styles.articlePreview}>
                                        <div 
                                            className={styles.articleGradient}
                                            style={{ background: article.gradient }}
                                        />
                                        <div className={styles.articleInfo}>
                                            <h3>{article.title}</h3>
                                            <p>{article.description}</p>
                                            <span className="text-sm text-gray-400">
                                                {article.date.toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className={styles.bentoItem}>
                        <h2 className={styles.sectionTitle}>Quick Links</h2>
                        <div className={styles.shortcutGrid}>
                            <Link href="/characters" className={styles.shortcut}>
                                <span className="w-4 h-4">👤</span>
                                Characters
                            </Link>
                            <Link href="/weapons" className={styles.shortcut}>
                                <span className="w-4 h-4">⚔️</span>
                                Weapons
                            </Link>
                            <Link href="/artifacts" className={styles.shortcut}>
                                <span className="w-4 h-4">🛡️</span>
                                Artifacts
                            </Link>
                            <Link href="/calculator" className={styles.shortcut}>
                                <span className="w-4 h-4">🧮</span>
                                Calculator
                            </Link>
                        </div>
                    </div>
                    <ClockBento />
                    <div className={styles.bentoItem}>
                        <h2 className={styles.sectionTitle}>Recent Characters</h2>
                        <div className={styles.horizontalList}>
                            {characters.map((char) => (
                                <Item 
                                    key={char.id} 
                                    category="character"
                                    src={getAssetURL("character", char.id, "avatar.png")}
                                    name={char.name}
                                    element={char.element}
                                    rarity={char.rarity}
                                    href={`/characters/${char.id}`}
                                    scale={0.8}
                                />
                            ))}
                        </div>
                    </div>
                    <div className={styles.bentoItem}>
                        <h2 className={styles.sectionTitle}>Recent Weapons</h2>
                        <div className={styles.horizontalList}>
                            {weapons.map((weapon) => (
                                <Item 
                                    key={weapon.id}
                                    category="weapon"
                                    src={getAssetURL("weapon", weapon.id, "base_avatar.png")}
                                    name={weapon.name}
                                    rarity={weapon.rarity}
                                    href={`/weapons/${weapon.id}`}
                                    scale={0.8}
                                />
                            ))}
                        </div>
                    </div>
                    <div className={styles.bentoItem}>
                        <h2 className={styles.sectionTitle}>Recent Artifacts</h2>
                        <div className={styles.horizontalList}>
                            {artifacts.map((artifact) => (
                                <Item 
                                    key={artifact.id}
                                    category="artifact"
                                    src={getAssetURL("artifact", artifact.id, "flower.png")}
                                    name={artifact.name}
                                    rarity={artifact.rarity_max}
                                    href={`/artifacts/${artifact.id}`}
                                    scale={0.8}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function PromotionBanner() {
    return (
        <div className={styles.promotionBanner}>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome to Irminsul.moe</h1>
                <p className="text-xs md:text-sm text-gray-300">Your comprehensive repository for all Teyvat meta-gaming information</p>
            </div>
        </div>
    )
}

function WishBento() {
    return (
        <div className={`${styles.bentoItem} ${styles.wishBento}`}>
            <Image
                src={"https://static.wikia.nocookie.net/gensin-impact/images/c/cd/The_Hearth%27s_Ashen_Shadow_2025-01-21.png"}
                alt="Current Banner"
                width={1100}
                height={619}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                }}
            />
        </div>
    )
}

function ChangeLogList() {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-gray-400">2024-01-21</span>
                <p className="text-sm">Version 4.4 Update</p>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-gray-400">2024-01-20</span>
                <p className="text-sm">New Character Guides Added</p>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-gray-400">2024-01-19</span>
                <p className="text-sm">Website Performance Updates</p>
            </div>
        </div>
    )
} 
