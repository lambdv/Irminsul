import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/navigation/Siderail"
import Topnav from "@/components/navigation/Topnav"
import ClientWrapper from "@/components/navigation/ClientWrapper"
import Footer from "@/components/navigation/Footer"
import { cookies } from 'next/headers'
import Head from "next/head"
import Sidedrawer from "@/components/navigation/Sidedrawer"
import ClientProvider from "@/components/navigation/ClientProvider"
import BottomNav from "@/components/navigation/bottomnav"
import MiniAIChat from "@/components/ui/MiniAIChat"
import RightSidenav from "../components/navigation/RightSidenav"


const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  description: "Genshin Impact Theorycrafting and Metagaming Suite",
  metadataBase: new URL("https://irminsul.moe"),
  keywords: [
      "Irminsul",
      "Irminsul.moe",
      "Genshin Impact",
      "Genshin Website",
      "Genshin Database",
      "Genshin Impact Theorycrafting",
      "Genshin Impact Metagaming",
      "Genshin Meta",
      "Genshin Impact guides",
      "Genshin character builds",
      "Genshin tier list",
      "Genshin Impact meta",
      "Genshin Impact theorycrafting",
      "Genshin Impact tools",
      "Genshin Impact calculator",
      "Best Genshin builds",
      "Theorycrafting",
      "Metagaming",
      "Theorycrafting tools",
      "Metagaming tools",
      "KeqingMains",
      "KQM",
      "Theorycrafting Library",
      "TCL",
      ""
  ],
  author: "Irminsul",
  robots: "index, follow",
  openGraph: {
      title: "Irminsul",
      description: "Genshin Impact Theorycrafting and Metagaming Suite",
      type: "website",
      url: "https://irminsul.moe",
  }
}

export default async function RootLayout({children}) {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value || 'dark'
  const language = cookieStore.get('language')?.value || 'en'

  return (
    <html lang={language} data-theme={theme} data-language={language}>
      <Head>
        <meta name="google-adsense-account" content="ca-pub-1739492299738628"/>
      </Head>
      <body className={inter.className}>
        <ClientProvider>
          <Topnav/>
          <Sidedrawer/>
          <Sidebar/>
          <div className="">
            {children}
          </div>
          {/* <SessionTest/> */}
        </ClientProvider>
      </body>
    </html>
  )
}