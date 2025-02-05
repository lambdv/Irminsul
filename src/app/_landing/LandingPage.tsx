import { getCharacters, getWeapons, getArtifacts } from '@/utils/genshinData';
import { getAssetURL } from '@/utils/getAssetURL';
import Image from 'next/image';
import styles from './index.module.css';
import ServerTimer from '@/app/_landing/ServerTimer';
import Item from '@/components/explore/Item';
import RecentComments from './RecentComments';
import Link from 'next/link';
import { articles } from '../articles/router';
import WishBanner from './WishBanner';

import { isAuthenticated, auth } from '@/app/(auth)/auth';


export default async function LandingPage() {
    const characters = await getCharacters().then(characters => characters.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()).slice(0, 5));
    const weapons = await getWeapons().then(weapons => weapons.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()).slice(0, 5));
    const artifacts = await getArtifacts().then(artifacts => artifacts.sort((a, b) => Number(b.release_version) - Number(a.release_version)).slice(0, 5));
    const latestArticles = articles.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 3);

    const isLoggedIn = await isAuthenticated();
    const user = await auth();

    return (
        <div className={styles.homePageContainer} style={{
        }}>
            {isLoggedIn ? 
            <>

            </>
            :  
             

            <div  style={{
                borderRadius: '14px',
                padding: '0rem 2rem',
                textAlign: 'left',
                margin: '0rem 1.2rem',
                marginBottom: '-1.5rem',
            }}>
                <h1 style={{fontSize: '2.5rem', fontFamily: 'ingame', fontWeight: '500',}}>Irminsul.moe</h1>
                <p className={styles.subtitle} style={{
                    textAlign: 'left',
                    margin: '0.5rem 0 0 0',
                    padding: 0,
                    fontSize: '0.9rem'
                }}>Repository for all metagaming information in Teyvat</p>
            </div>
            }



            <div className={styles.bentoGrid}>
                <div className={`${styles.bentoItem} ${styles.featured}`}>
                    <WishBanner />
                </div>
                
                <div className={`${styles.bentoItem} ${styles.serverTime}`}>
                    <ServerTimer />
                </div>


                <div className={`${styles.bentoItem} ${styles.quickLinks}`}>
                    <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
                    <div className={styles.linkGrid}>
                        <Link href="/archive/characters" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            transition: 'all 0.2s ease',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(4px)'
                        }}>
                            <Image 
                                src="/imgs/icons/character.png" 
                                alt="Characters" 
                                width={24} 
                                height={24} 
                                style={{objectFit: 'contain'}}
                            />
                            <span style={{
                                fontSize: '0.9rem',
                                fontWeight: 500
                            }}>Characters</span>
                        </Link>

                        <Link href="/archive/weapons" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            transition: 'all 0.2s ease',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(4px)'
                        }}>
                            <Image src="/imgs/icons/weaponIcon.png" alt="Weapons" width={24} height={24} style={{objectFit: 'contain'}} />
                            <span style={{
                                fontSize: '0.9rem',
                                fontWeight: 500
                            }}>Weapons</span>
                        </Link>

                        <Link href="/archive/artifacts" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            transition: 'all 0.2s ease',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(4px)'
                        }}>
                            <Image src="/imgs/icons/artifactIcon.png" alt="Artifacts" width={24} height={24} style={{objectFit: 'contain'}} />
                            <span style={{
                                fontSize: '0.9rem',
                                fontWeight: 500
                            }}>Artifacts</span>
                        </Link>

                        <Link href="/articles" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            transition: 'all 0.2s ease',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(4px)'
                        }}>
                            <span className={styles.icon + " material-symbols-rounded"}>article</span>
                            <span style={{
                                fontSize: '0.9rem',
                                fontWeight: 500
                            }}>Articles</span>
                        </Link>

                        <Link href="/seelie" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            transition: 'all 0.2s ease',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(4px)'
                        }}>
                            <Image src="/imgs/icons/seelie.png" alt="Seelie" width={24} height={24} style={{objectFit: 'contain'}} />
                            <span style={{
                                fontSize: '0.9rem',
                                fontWeight: 500
                            }}>Seelie AI</span>
                        </Link>

                        <Link href="/login" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            transition: 'all 0.2s ease',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(4px)'
                        }}>
                            <span className={styles.icon + " material-symbols-rounded"}>login</span>
                            <span style={{
                                fontSize: '0.9rem',
                                fontWeight: 500
                            }}>Login</span>
                        </Link>

                        
                        





                    </div>
                </div>

                
                <div className={`${styles.bentoItem} ${styles.latestArticles}`}>
                    <h3 className="text-xl font-semibold mb-4">Latest Articles</h3>
                    <div className={styles.articlesList} style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {latestArticles.map((article, index) => (
                            <Link 
                                key={index}
                                href={`/articles/${article.slug}`}
                                className={styles.articleItem}
                                style={{
                                    background: article.gradient,
                                    borderRadius: '5px',
                                    padding: '1.5rem',
                                    position: 'relative',
                                    minHeight: '180px',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    gap: '1rem',
                                    backdropFilter: 'blur(10px)',
                                    overflow: 'hidden'
                                }}
                            >
                                <h4 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '600',
                                    lineHeight: '1.4',
                                    color: '#fff'
                                }}>{article.title}</h4>
                                <p style={{
                                    fontSize: '0.9rem',
                                    color: 'rgba(255,255,255,0.8)',
                                    fontWeight: '400'
                                }}>
                                    {article.date.toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className={`${styles.bentoItem} ${styles.latestContent} overflow-hidden`}>
                    <div className={styles.latestSection}>
                        <h3 className="text-xl font-semibold mb-4">Latest Characters</h3>
                        <div className="flex flex-row gap-4" role="list" aria-label="Latest characters horizontal scroll">

                            {characters.map((char) => (
                                <div key={char.id} role="listitem">
                                    <Item
                                        category="character"
                                        src={getAssetURL("character", char.id, "avatar.png")}
                                        name={char.name}
                                        element={char.element}
                                        rarity={char.rarity}
                                        scale={1}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.latestSection}>
                        <h3 className="text-xl font-semibold mb-4">Latest Weapons</h3>
                        <div className="flex flex-row gap-4" role="list" aria-label="Latest weapons horizontal scroll">

                            {weapons.map((weapon) => (
                                <div key={weapon.id} role="listitem">
                                    <Item
                                        category="weapon"
                                        src={getAssetURL("weapon", weapon.id, "base_avatar.png")}
                                        name={weapon.name}
                                        rarity={weapon.rarity}
                                        scale={1}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.latestSection}>
                        <h3 className="text-xl font-semibold mb-4">Latest Artifacts</h3>
                        <div className="flex flex-row gap-4" role="list" aria-label="Latest artifacts horizontal scroll">

                            {artifacts.map((artifact) => (
                                <div key={artifact.id} role="listitem">
                                    <Item
                                        category="artifact"
                                        src={getAssetURL("artifact", artifact.id, "flower.png")}
                                        name={artifact.name}
                                        rarity={artifact.rarity_max}
                                        scale={1}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <RecentComments />


                
            </div>
        </div>
    );
} 