import Link from "next/link"
import articlesCSS from "./articles.module.css"
import BrowseHeader from "@/components/explore/BrowseHeader"
import Head from "next/head"
import MockIcon from "@public/imgs/icons/Element_Anemo.png"
import { ArticleFitlerStore } from "./filterstate"
import ArticleList from "./articleList"


export const metadata = {
  title: "Articles | Irminsul",
}

export default function Articles() {
  return (
    <div>
      <BrowseHeader materialIcon="article" title="Articles" store={ArticleFitlerStore} useFilter={false}/>
      <p style={{padding:"10px 20px", marginTop:"-10px", fontSize:"12px", color:"#3f3f3f"}}>currently written and published by our admin team.</p>
      <ArticleList store={ArticleFitlerStore}/>
    </div>


  )
}
