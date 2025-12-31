import { Inter } from "next/font/google"
import "@/app/globals.css"

import { cookies } from "next/headers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  description: "Genshin Impact Database",
}

export default async function RootLayout({ children }) {
  const cookieStore = await cookies()
  const theme = cookieStore.get("theme")?.value || "dark"
  const language = cookieStore.get("language")?.value || "en"

  return <div className="focusedPageContentContainer">{children}</div>
}
