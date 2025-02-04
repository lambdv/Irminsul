import { getCharacters, getWeapons, getArtifacts } from '@/utils/genshinData';
import { getAssetURL } from '@/utils/getAssetURL';
import Image from 'next/image';
import styles from './index.module.css';
import ServerTimer from '@/app/_landing/ServerTimer';
import Item from '@/components/explore/Item';
import RecentComments from './RecentComments';

export default async function LandingPage() {
    const characters = await getCharacters().then(characters => characters.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()).slice(0, 4));
    const weapons = await getWeapons().then(weapons => weapons.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()).slice(0, 4));
    const artifacts = await getArtifacts().then(artifacts => artifacts.sort((a, b) => Number(b.release_version) - Number(a.release_version)).slice(0, 4));

    return (
        <div className={styles.homePageContainer}>
            {/* <div className={styles.heroSection}>
                <h1>Irminsul.moe</h1>
                <p className={styles.subtitle}>Your comprehensive repository for all Teyvat metagaming information</p>
            </div> */}

            <div className={styles.bentoGrid}>
                <div className={`${styles.bentoItem} ${styles.featured}`}>
                    <WishBanner />
                </div>
                
                <div className={`${styles.bentoItem} ${styles.serverTime}`}>
                    <ServerTimer />
                </div>

                <RecentComments />

                <div className={`${styles.bentoItem} ${styles.quickLinks}`}>
                    <h3>Quick Links</h3>
                    <div className={styles.linkGrid}>
                        <a href="/characters">Characters Database</a>
                        <a href="/weapons">Weapons Database</a>
                        <a href="/artifacts">Artifacts Database</a>
                        <a href="/calculator">Damage Calculator</a>
                    </div>
                </div>

                <div className={`${styles.bentoItem} ${styles.latestContent}`}>
                    <div className={styles.latestSection}>
                        <h3>Latest Characters</h3>
                        <div className={styles.itemGrid} role="list" aria-label="Latest characters horizontal scroll">
                            {characters.map((char) => (
                                <div key={char.id} role="listitem">
                                    <Item
                                        category="character"
                                        src={getAssetURL("character", char.id, "avatar.png")}
                                        name={char.name}
                                        element={char.element}
                                        rarity={char.rarity}
                                        scale={0.8}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.latestSection}>
                        <h3>Latest Weapons</h3>
                        <div className={styles.itemGrid} role="list" aria-label="Latest weapons horizontal scroll">
                            {weapons.map((weapon) => (
                                <div key={weapon.id} role="listitem">
                                    <Item
                                        category="weapon"
                                        src={getAssetURL("weapon", weapon.id, "base_avatar.png")}
                                        name={weapon.name}
                                        rarity={weapon.rarity}
                                        scale={0.8}

                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.latestSection}>
                        <h3>Latest Artifacts</h3>
                        <div className={styles.itemGrid} role="list" aria-label="Latest artifacts horizontal scroll">
                            {artifacts.map((artifact) => (
                                <div key={artifact.id} role="listitem">
                                    <Item
                                        category="artifact"
                                        src={getAssetURL("artifact", artifact.id, "flower.png")}
                                        name={artifact.name}
                                        rarity={artifact.rarity_max}
                                        scale={0.8}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                
            </div>
        </div>
    );
}

function WishBanner() {
    return (
        <div className={styles.wishBanner}>
            <div className={styles.bannerContent}>
                <Image 
                    src={"https://static.wikia.nocookie.net/gensin-impact/images/b/bd/Wanderlust_Invocation_2020-11-11.png"} 
                    alt="Featured Banner" 
                    width={1100} 
                    height={1100} 
                    className={styles.bannerImage}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                    }}
                />
            </div>
        </div>
    );
} 