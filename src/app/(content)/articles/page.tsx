import Link from "next/link"
import { articles } from "./articles"

export default function Articles() {
  const articlesList = articles()
  return (
    <div>
      <h1>Articles</h1>
      <ul>
        {articlesList.map((article) => (
          <Link key={article.slug} href={`/articles/${article.slug}`}>
            <li style={{listStyleType: "disc"}}>
              {article.title}
            </li>
          </Link>
        ))}
      </ul>
    </div>
  )
}
