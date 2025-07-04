import { getCharacters, getWeapons, getArtifacts } from '@/utils/genshinData';
import { getAssetURL } from '@/utils/getAssetURL';
import Image from 'next/image';
import styles from './index.module.css';
import ServerTimer from '@root/src/app/(main)/_landing/ServerTimer';
import Item from '@/components/explore/Item';
import RecentComments from './RecentComments';
import Link from 'next/link';
import { articles } from '../articles/router';
import WishBanner from './WishBanner';


import { isAuthenticated } from '@/app/(auth)/actions'
import RightSidenav from '@/components/navigation/RightSidenav';
import Advertisment from '@/components/ui/Advertisment';
import { auth } from '@/app/(auth)/auth'


export default async function LandingPage() {
    const characters = await getCharacters().then(characters => characters.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()).slice(0, 5));
    const weapons = await getWeapons().then(weapons => weapons.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()).slice(0, 5));
    const artifacts = await getArtifacts().then(artifacts => artifacts.sort((a, b) => Number(b.release_version) - Number(a.release_version)).slice(0, 5));
    // const latestArticles = articles.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 3);

    // const isLoggedIn = await isAuthenticated();
    // const user = await auth();

    return (
        <div className={styles.homePageContainer} style={{}}>

      
                <div style={{
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
                    }}>Repository for all of the information and memories of Teyvat.</p>
                </div>
            

                <RightSidenav>
                    <div className={`${styles.bentoItem} ${styles.ad}`}>
                        <br />
                        <Advertisment type="card"/>
                    </div>
                </RightSidenav>


            
            <div className={styles.bentoGrid} style={{
                margin: '1rem 1.2rem'
            }}>
                {/* <div className={`${styles.bentoItem} ${styles.featured}`}>
                    <WishBanner />
                </div> */}


  

                {/* <div className={`${styles.bentoItem} ${styles.serverTime}`}>
                    <ServerTimer />
                </div> */}




                
                {/* <div className={`${styles.bentoItem} ${styles.latestArticles}`}>
                    <h3 className="text-xl font-semibold mb-4" style={{color: 'var(--text-color)'}}>Latest Articles</h3>
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
                </div> */}

                <div className={``}>
                    <div className={styles.latestSection}>
                        <h3 className="text-xl font-semibold mb-4" style={{color: 'var(--text-color)'}}>Latest Characters</h3>
                        <div className="flex flex-row" role="list" aria-label="Latest characters horizontal scroll">

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
                        <h3 className="text-xl font-semibold mb-4" style={{color: 'var(--text-color)'}}>Latest Weapons</h3>
                        <div className="flex flex-row" role="list" aria-label="Latest weapons horizontal scroll">

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
                        <h3 className="text-xl font-semibold mb-4" style={{color: 'var(--text-color)'}}>Latest Artifacts</h3>
                        <div className="flex flex-row" role="list" aria-label="Latest artifacts horizontal scroll">

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

                {/* <RecentComments /> */}


                
            </div>
            <Advertisment type="card"/>
        </div>
    );
} 