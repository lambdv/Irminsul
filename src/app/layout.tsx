import { Inter } from "next/font/google"
import "./globals.css"
import Sidenav from "@/components/navigation/Sidenav"
import Topnav from "@/components/navigation/Topnav"
import ClientWrapper from "@/components/navigation/ClientWrapper"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Irminsul",
  url: "https://irminsul.moe",
  description: "Genshin Impact curated ingame & meta/tc information Database & Tools",
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-1739492299738628"/>
      </head>
      <body className={inter.className}>
        <ClientWrapper>
          <Topnav/>
          <Sidenav/>
          <main id="content">
            {children}
          </main>
        </ClientWrapper>
      </body>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1739492299738628" crossOrigin="anonymous"></script>
    </html>
  )
}