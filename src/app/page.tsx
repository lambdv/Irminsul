import { getCharacters, getWeapons, getArtifacts } from '@/utils/genshinData';
import Item from '@/components/explore/Item';
import { getAssetURL } from '@/utils/getAssetURL'
import Image from 'next/image'
import styles from './index.module.css'
import Loading from './loading'

//meta data
export const metadata = {
    title: "Irminsul.moe | Repository for all of metagaming information of Teyvat",
    metadataBase: new URL("https://irminsul.moe"),
    description: "Repository for all of metagaming information of Teyvat",
    keywords: [
        "Genshin Impact", 
        "Teyvat", 
        "Irminsul", 
        "Repository", 
        "Information", 
        "Metagaming", 
        "Database", 
        "Meta", 
        "Theorycrafting", 
        "Knowledge Base", 
        "Genshin Impact", 
        "Teyvat",
        "Guides",
        "Articles",
        "Genshin Data",
        "Tools",
    ],
    author: "Irminsul",
    robots: "index, follow",
}

export default async function Home() {
    const characters = await getCharacters().then(characters => characters.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()).slice(0, 5))
    const weapons = await getWeapons().then(weapons => weapons.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()).slice(0, 5))
    const artifacts = await getArtifacts().then(artifacts => artifacts.sort((a, b) => Number(b.release_version) - Number(a.release_version)).slice(0, 5))

    return (
        <div id="home-page-container" className={styles.homePageContainer}>
            <p>home</p>

            <div id="bentobox" className={styles.bentoBoxContainer}>
                {/* promotion banner */}
                <WishBento/> {/* latest in game wish banners*/}
                <ChangeLogBento/> {/* latest character, wepaon, artifacts ect*/}
                {/* comments */}
                {/* latest articles */}
                {/* short cuts */}
                {/* server timer */}
            </div>
        </div>
    );
}

function WishBento(){
    return (
        <div className={styles.wishBento}>
            <p>banner</p>
        </div>
    )
}

function ChangeLogBento(){
    return (
        <div className={styles.changeLogBento}>
            <p>changelogs</p>
        </div>
    )
}