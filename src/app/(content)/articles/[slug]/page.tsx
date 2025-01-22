import React from 'react'
import { articles } from '../articles'

export default async function ArticlePage({params}) {
  const {slug} = await params
  const articlesList = articles()
  const article = articlesList.find((article) => article.slug === slug)
  const found: boolean = article !== undefined

  if(!found){
    return <div>Article not found</div>
  }

  return (
    <div>{article.content}</div>
  )
}
