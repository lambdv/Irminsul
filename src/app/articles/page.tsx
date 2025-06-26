import Link from "next/link"
import articlesCSS from "./articles.module.css"
import BrowseHeader from "@/components/explore/BrowseHeader"
import Head from "next/head"
import { getCDNURL } from '@/utils/getAssetURL'
import { ArticleFitlerStore } from "./filterstate"
import ArticleList from "./articleList"
import Advertisment from "@/components/ui/Advertisment"
import RightSidenav from "@/components/navigation/RightSidenav"

const MOCK_ICON = getCDNURL("imgs/icons/Element_Anemo.png")

export const metadata = {
  title: "Articles | Irminsul",
}

export default function Articles() {
  return (
    <div>
      <BrowseHeader materialIcon="article" title="Articles" store={ArticleFitlerStore} useFilter={false}/>
      
      <RightSidenav>
        <br />
        <Advertisment type="card"/>
      </RightSidenav>

      <p style={{padding:"10px 20px", marginTop:"-10px", fontSize:"12px", color:"#3f3f3f"}}>currently written and published by our admin team.</p>
      <ArticleList store={ArticleFitlerStore}/>
      <br />
      <Advertisment type="card"/>

      </div>
  )
}
