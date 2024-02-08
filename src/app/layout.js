import { Inter } from "next/font/google";
import "@/css/globals.css";
import "@/css/waves.css"
import Script from 'next/script'

//components
import Sidenav from "@/components/navigation/Sidenav";
import Topnav from "@/components/navigation/Topnav";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Irminsul",
  description: "Information Respository for Genshin Impact.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>

      <body className={inter.className}>
        <Topnav/>
        <div className="wrapper">
          <Sidenav/>
          <main id="content">
            {children}
          </main>
        </div>
        <Script src="../js/waves.js" />
      </body>

    </html>
  );
}
