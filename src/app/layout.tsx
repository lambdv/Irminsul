import { Inter } from "next/font/google";
import "./index.css";
import "./waves.css";
import Sidenav from "@/components/navigation/Sidenav";
import Topnav from "@/components/navigation/Topnav";
import ClientWrapper from "@/components/navigation/ClientWrapper";
import RightSidenav from "@/components/navigation/RightSidenav";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  description: "Genshin Impact Database",
};

export default function RootLayout({children}) {
  return (
    <html lang="en">
      <head></head>
      <body className={inter.className}>
        <ClientWrapper>
          <Topnav/>
          <Sidenav/>
          <main id="content">
            {children}
          </main>
        </ClientWrapper>
      </body>
    </html>
  );
}