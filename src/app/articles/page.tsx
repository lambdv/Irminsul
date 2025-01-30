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
      <ArticleList store={ArticleFitlerStore}/>
    </div>
  )
}
