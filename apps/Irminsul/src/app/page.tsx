import LandingPage from './_landing/LandingPage';

//meta data
const slogan = "Genshin Impact Metagaming/Theorycrafting Database and Tooling Suite"
const title = "Irminsul | Genshin Impact Theorycrafting/Metagaming Suite"
export const metadata = {
    title: title,
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
        title: title,
        description: slogan,
        type: "website",
        url: "https://irminsul.moe",
    }
}

export default async function Home() {
    return <>
        <LandingPage />
    </>;
}