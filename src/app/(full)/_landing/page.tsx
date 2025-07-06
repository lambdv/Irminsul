import LandingCSS from './landing.module.css'
import Btn from '@/components/ui/Btn'
import RoundBtn from '@/components/ui/RoundBtn'
import { getAssetURL, getCDNURL } from '@/utils/getAssetURL'
import Item from '@root/src/components/explore/Item'
import { getArtifacts, getCharacters, getWeapons } from '@root/src/utils/genshinData'
import Link from 'next/link'

export const metadata = {
    title: "Irminsul | Genshin Impact Theorycrafting/Metagaming Suite",
}

export default async function Home() {
    return (
        <div className={LandingCSS.landingPageWrapper}>
            <div className={LandingCSS.banner}>
                {/* Left Side - Text, Slogan, and Buttons */}
                <div className={LandingCSS.leftWrapper}>
                    <div className={LandingCSS.heroContent}>
                        <h1 className={LandingCSS.heroTitle}>
                            Everything Genshin
                            <span className={LandingCSS.highlight}> Theorycrafting</span>
                            <br />
                            and <span className={LandingCSS.highlight}>Metagaming</span>
                        </h1>
                        
                        <div className={LandingCSS.heroDescription}>
                            <p>Irminsul is an intergrated suite of Genshin Impact tools and resources, such as a database, a metagaming AI, and more.</p>
                        </div>

                        <div className={LandingCSS.buttonGroup}>
                            <Link href="/login" className={LandingCSS.primaryBtn}>
                                    Sign in
                            </Link>
                            <Link href="/support" className={LandingCSS.secondaryBtn}>
                                    Support
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Side - Features Showcase */}
                <div className={LandingCSS.rightWrapper}>
                    <div className={LandingCSS.featuresContainer}>
                        {/* Seelie AI Feature */}
                        <div className={LandingCSS.featureCard + ' ' + LandingCSS.seelieCard}>
                            <div className={LandingCSS.featureHeader}>
                                <img 
                                    src={getCDNURL("imgs/icons/seelie.png")} 
                                    alt="Seelie AI" 
                                    className={LandingCSS.featureIcon}
                                />
                                <h3>Seelie AI</h3>
                            </div>
                            <p className={LandingCSS.featureDescription}>
                                Your AI guide for Genshin Impact. Get instant answers about builds, rotations, and game mechanics.
                            </p>
                            <div className={LandingCSS.featureDemo}>
                                <div className={LandingCSS.chatPreview}>
                                    <div className={LandingCSS.chatBubble}>
                                        "What's the best build for Raiden Shogun?"
                                    </div>
                                    <div className={LandingCSS.chatBubble + ' ' + LandingCSS.aiResponse}>
                                        "For Raiden Shogun, I recommend..."
                                    </div>
                                </div>
                            </div>
                            <Link href="/seelie" className={LandingCSS.featureLink}>
                                Try Seelie AI →
                            </Link>
                        </div>

                        {/* Database Features */}
                        <div className={LandingCSS.featureCard + ' ' + LandingCSS.databaseCard}>
                            <div className={LandingCSS.featureHeader}>
                                <span className="material-symbols-rounded" style={{fontSize: '2rem', color: 'var(--primary-color)'}}>
                                    database
                                </span>
                                <h3>Database Changelog</h3>
                            </div>
                            {/* <Link href="/archive" className={LandingCSS.featureLink}>
                                Browse Archive →
                            </Link> */}
                            <div className={LandingCSS.latestItems}>
                                {latestGenshinData()}
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

async function latestGenshinData(){
    const Characters = await getCharacters()
    const Artifacts = await getArtifacts()
    const Weapons = await getWeapons()

    const latestCharacters = Characters
        .sort((a, b) => Number(b.release_date_epoch || 0) - Number(a.release_date_epoch || 0))
        .slice(0, 3)
        .map(item => ({
            ...item,
            category: "character"
        }))
    const latestWeapons = Weapons
        .sort((a, b) => Number(b.release_date_epoch || 0) - Number(a.release_date_epoch || 0))
        .slice(0, 2)
        .map(item => ({
            ...item,
            category: "weapon"
        }))
    const latestArtifacts = Artifacts
        .sort((a, b) => Number(b.release_version || 0) - Number(a.release_version || 0))
        .slice(0, 2)
        .map(item => ({
            ...item,
            category: "artifact"
        }))

    const latest = [...latestCharacters, ...latestArtifacts, ...latestWeapons]

    return <div className="flex flex-wrap gap-0">
        {latest.map((item) => {
            switch(item.category){
                case "character":
                    return  <Item
                    category="character"
                    src={getAssetURL("character", item.id, "avatar.png")}
                    name={item.name}
                    element={item.element}
                    rarity={item.rarity}
                    scale={1}
                />
                case "artifact":
                    return <Item
                    category="artifact"
                    src={getAssetURL("artifact", item.id, "flower.png")}
                    name={item.name}
                    rarity={item.rarity_max}
                    scale={1}
                />
                case "weapon":
                    return <Item
                    category="weapon"
                    src={getAssetURL("weapon", item.id, "base_avatar.png")}
                    name={item.name}
                    rarity={item.rarity}
                    scale={1}
                />
                default:
                    return null
            }      
        })}
    </div>
}