import { Inter } from "next/font/google"
import "@/app/globals.css"
import Sidebar from "@/components/navigation/Siderail"
import Topnav from "@/components/navigation/Topnav"

import { SessionProvider } from "next-auth/react"
import { cookies } from 'next/headers'
import Head from "next/head"
import Sidedrawer from "@/components/navigation/Sidedrawer"
import ClientProvider from "@/components/navigation/ClientProvider"


const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  description: "Genshin Impact Database",
}

export default async function RootLayout({children}) {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value || 'dark'
  const language = cookieStore.get('language')?.value || 'en'

  return (
    <div className="focusedPageContentContainer">
        {children}
    </div>
  )
}