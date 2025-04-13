import LandingPage from './_landing/LandingPage';
import Loading from './loading';

//meta data
const slogan = "Genshin Impact Metagaming/Theorycrafting Database, Knowledge Base, Wiki, Guides, and Tools"
export const metadata = {
    title: "Irminsul | " + slogan,
    metadataBase: new URL("https://irminsul.moe"),
    description: slogan,
    keywords: [
        "Genshin Impact guides",
        "Genshin character builds",
        "Genshin Impact database",
        "Genshin weapon tier list",
        "Genshin Impact meta",
        "Genshin theorycrafting",
        "Genshin Impact tools",
        "Genshin artifact guide",
        "Genshin team comps",
        "Genshin Impact wiki",
        "Genshin Impact calculator",
        "Best Genshin builds",
        "Genshin Impact strategy",
        "Genshin Impact optimization"
    ],
    author: "Irminsul",
    robots: "index, follow",
    openGraph: {
        title: "Irminsul.moe | Genshin Impact Database & Guides",
        description: "Genshin Impact Metagaming/Theorycrafting Database, Knowledge Base, Wiki, Guides, and Tools",
        type: "website",
        url: "https://irminsul.moe",
    }
}

export default function Home() {
    return <LandingPage/>
}