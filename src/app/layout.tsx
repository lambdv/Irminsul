import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/navigation/Sidenav"
import Topnav from "@/components/navigation/Topnav"
import ClientWrapper from "@/components/navigation/ClientWrapper"
import Footer from "@/components/navigation/Footer"
import { SessionProvider } from "next-auth/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { cookies } from 'next/headers'
import Head from "next/head"

const inter = Inter({ subsets: ["latin"] })

// Simple translation dictionary
const translations = {
  cn: {
    // Navigation
    'Home': '首页',
    'Settings': '设置',
    'Search': '搜索',
    'Profile': '个人资料',
    'Log Out': '登出',
    'Sign In': '登录',
    // Common words
    'Loading': '加载中',
    'Error': '错误',
    'Submit': '提交',
    'Cancel': '取消',
    'Save': '保存',
    'Delete': '删除',
    'Edit': '编辑',
    // Add more translations as needed
  }
};

export const metadata = {
  description: "Genshin Impact Database",
}

export default async function RootLayout({children}) {
  // Get theme from cookies on server side
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value || 'dark'
  const language = cookieStore.get('language')?.value || 'en'

  // Function to translate text based on current language
  const t = (text: string) => {
    if (language === 'en') return text;
    return translations[language]?.[text] || text;
  }

  return (
    <html lang={language} data-theme={theme} data-language={language}>
      <Head>
        <meta name="google-adsense-account" content="ca-pub-1739492299738628"/>
        {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1739492299738628" crossOrigin="anonymous"></script> */}
      </Head>
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
    </html>
  )
}