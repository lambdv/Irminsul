import LandingPage from './_landing/LandingPage';

//meta data
export const metadata = {
    title: "Irminsul | Repository for all of metagaming information of Teyvat",
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

export default function Home() {
    return <LandingPage />;
}