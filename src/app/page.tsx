import LandingPage from './_landing/LandingPage';

//meta data
const slogan = "Everything Genshin Impact Metagaming"
export const metadata = {
    title: "Irminsul | " + slogan,
    metadataBase: new URL("https://irminsul.moe"),
    description: slogan,
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
        "Guides",
        "Articles",
        "Genshin Data",
        "Tools",
    ],
    author: "Irminsul",
    robots: "index, follow",
}

export default function Home() {
    return <LandingPage />;
}