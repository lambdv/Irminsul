"use client"
import Link from "next/link"
import { articles } from "./router"
import styles from "./articles.module.css"
import Image from "next/image"


export default function ArticleList(props: {store: any}){
    const articlesList = articles
    const { descending } = props.store()
    
    return (
      <div id="article-list" style={{display: "flex", flexDirection: "row", gap: "10px", paddingLeft: "20px", paddingRight: "20px", flexWrap: "wrap"}}>
        {articlesList
            .sort((a,b) => descending ? b.date.getTime() - a.date.getTime() : a.date.getTime() - b.date.getTime())
            .map((article) => (
            <ArticleCard key={article.slug} article={article}/>
            ))}
      </div>
    )
  }
  
function ArticleCard(props: {article: any}){
    return (
        <Link href={`/articles/${props.article.slug}`} className="waves-effect waves-light ripple" style={{borderRadius: "10px"}}>
            <div className={styles.articleCard}>
                <div style={{
                  position: "relative", 
                  width: "100%", 
                  height: "180px",
                  overflow: "hidden",
                  borderRadius: "10px",
                  background: props.article.gradient
                }}>
                </div>
                
                <p className="text-sm text-gray-400" style={{top: "5px", position: "relative"}}>{props.article.date.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}</p>
                <h1>{props.article.title}</h1>
                <p>{props.article.description}</p>
                <div>
                </div>
            </div>
        </Link>
    )
}