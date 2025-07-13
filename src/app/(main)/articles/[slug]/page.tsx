import React, { Suspense } from 'react'
import { articles } from '../router'
import articleCSS from './article.module.css'
import RightSidenav from '@/components/navigation/RightSidenav'
import { Metadata } from 'next'
import { getUser, getUserById } from '@/app/(auth)/actions'


import Image from 'next/image'
import Divider from '@/components/ui/Divider'
import CommentSection from '@/components/ui/CommentSection'
import Link from 'next/link'
import Advertisment from '@/components/ui/Advertisment'

export async function generateMetadata({params}) {
  const {slug} = await params
  const article =  articles.find((article) => article.slug === slug)
  if(article === undefined)
    return {}
  return {
    title: `${article.title} | Irminsul`,
    description: article.description,
  }
}

export async function generateStaticParams() {
  const articleList = articles
  const articleIDs = articleList.map((article) => ({ slug: article.slug }))
  return articleIDs.map(a => {
    return {
      slug: a.slug,
      data: articleList.find((article) => article.slug === a.slug)
    }
  })
}

export default async function ArticlePage({params}) {
  const {slug} = await params
  const article = params.data ? params.data : articles.find((article) => article.slug === slug)
  
  if(article === undefined) 
    return <div>Article not found</div>

  return (
    <div>
      <ArticleHeader article={article} />

      <main className={articleCSS.articleContent}>
        <Divider/>
        <RightSidenav>
          <ul>
            {article.tableOfContents.map((item, index) => {
                return <li key={index}><Link href={`/articles/${article.slug}#${item.slug}`}>{item.title}</Link></li>  
            })}
          </ul>
          <br/>
          <Advertisment type="card"/>
        </RightSidenav>
        {article.content}
        <br />
        <Suspense fallback={<div>Loading...</div>}>
          <CommentSection pageID={`articles/${article.slug}`}/>
        </Suspense>
      </main>
    </div>
  )
}

async function ArticleHeader(props: {article: any}) {
  const user = await getUserById(props.article.authorUserID)
  return (
    <div className={articleCSS.articleHeader} style={{paddingTop: '1rem', paddingBottom: '1rem'}}>
      <p className={articleCSS.articleDate} >{props.article.date.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}</p>
      <h1 className={articleCSS.articleTitle}>{props.article.title}</h1>
      {/* <p className={articleCSS.articleDescription}>{props.article.description}</p> */}
      <div className="mb-1"></div>
      <p className="text-sm" style={{color: '#878787'}}>Posted by</p>
      <div className={articleCSS.articleAuthor + " flex items-center gap-2"}>
        <Image 
          className="rounded-full" 
          src={user?.image ?? "/assets/images/default-avatar.png"} 
          alt={user?.name ?? "Unknown"} 
          width={35} 
          height={35} 
          unoptimized={true}
        />
        {user ? user.name : "Unknown"}
        {user.id === "d4882fcc-8326-4fbb-8b32-d09c0fb86875" && (
          <span style={{fontSize: "16px", top: "0px", left: "-3px", userSelect: "none"}} className="material-symbols-rounded relative" title="Verified">verified</span>
        )}
      </div>
    </div>
  )
}
