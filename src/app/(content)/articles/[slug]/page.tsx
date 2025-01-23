import React from 'react'
import { Article, articles } from '../articles'
import articleCSS from './article.module.css'
import RightSidenav from '@/components/navigation/RightSidenav'
import { Metadata } from 'next'
import { getUser } from '@/app/(auth)/auth'
import Image from 'next/image'
import Divider from '@/components/ui/Divider'

export async function generateMetadata({params}) {
  const {slug} = await params
  const article =  articles().find((article) => article.slug === slug)
  if(article === undefined)
    return {}
  return {
    title: `${article.title} | Irminsul`,
    description: article.description,
  }
}

export async function generateStaticParams() {
    return articles().map((article) => ({ slug: article.slug }))
}

export default async function ArticlePage({params}) {
  const {slug} = await params
  const article = articles().find((article) => article.slug === slug)
  
  if(article === undefined) return <div>Article not found</div>

  return (
    <div>
      <ArticleHeader article={article} />
      
      <main className={articleCSS.articleContent}>
        <Divider/>
        
        <RightSidenav style={{
        }}>
          <ul>
            <li>Abstract</li>
            <li>Introduction</li>
            <li>Methods</li>
            <li>Results</li>
            <li>Discussion</li>
            <li>Conclusion</li>
          </ul>
          <br />
        </RightSidenav>
       
        
        {article.content}
      </main>
    </div>
  )
}


async function ArticleHeader(props: {
  article: Article
}) {
  const user = await getUser(props.article.authorUserID)

  return (
    <div className={articleCSS.articleHeader}>
      <p className={articleCSS.articleDate}>{props.article.date}</p>
      <h1 className={articleCSS.articleTitle}>{props.article.title}</h1>
      <p className={articleCSS.articleDescription}>{props.article.description}</p>
      <div className="mb-1"></div>
      <p className="text-gray-500 text-sm">Posted by</p>
      <div className={articleCSS.articleAuthor + " flex items-center gap-2"}>
        <Image className="rounded-full" src={user?.image ?? "/assets/images/default-avatar.png"} alt={user?.name ?? "Unknown"} width={35} height={35} />
        {user ? user.name : "Unknown"}
      </div>
    </div>
  )
}
