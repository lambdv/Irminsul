import { Inter } from "next/font/google"
import "./globals.css"
import SideRail from "@/components/navigation/SideRail"
import Sidebar from "@/components/navigation/Sidenav"
import Topnav from "@/components/navigation/Topnav"
import ClientWrapper from "@/components/navigation/ClientWrapper"
import Footer from "@/components/navigation/Footer"
import { SessionProvider } from "next-auth/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  description: "Genshin Impact Database",
}

export default function RootLayout({children}) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-1739492299738628"/>

      </head>
      <body className={inter.className}>
        <SessionProvider>
          <ClientWrapper>
            <Topnav/>
            <Sidebar/>
            <main className="pageContentContainer">
              {children}
              {/* <Footer/> */}
            </main>
          </ClientWrapper>
        </SessionProvider>
      </body>
      <script 
        async 
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1739492299738628"
        crossOrigin="anonymous"></script>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1739492299738628" crossOrigin="anonymous"></script>
    </html>
  )
}