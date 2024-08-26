import { Inter } from "next/font/google";
import Script from 'next/script';
import "@/styles/index.css";
import "@/styles/waves.css";
import Sidenav from "@/components/navigation/Sidenav";
import Topnav from "@/components/navigation/Topnav";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Irminsul",
  description: "Genshin Impact Database",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head></head>
      <body className={inter.className}>
        <Topnav/>
        <div className="wrapper">
          <Sidenav/>
          <main id="content">
            {children}
          </main>
        </div>
        <Script src="./waves.js" />
      </body>
    </html>
  );
}