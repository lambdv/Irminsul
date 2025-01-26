import Link from "next/link"
import { articles } from "./articles"
import articlesCSS from "./articles.module.css"
import BrowseHeader from "@/components/explore/BrowseHeader"

import MockIcon from "@public/imgs/icons/Element_Anemo.png"
import { ArticleFitlerStore } from "./filterstate"
import ArticleList from "./articleList"

export default function Articles() {
  return (
    <div>
      <BrowseHeader materialIcon="article" title="Articles" store={ArticleFitlerStore}/>
      <ArticleList/>
    </div>
  )
}
