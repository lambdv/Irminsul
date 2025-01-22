import React from 'react'

const article = {
  title: "Terminology",
  description: "A list of terms and their definitions.",
  author: "Irminsul",
  date: "2025-01-21", 
  slug: "terminology",
  content: Body()
}

function Body(){
    return (
        <div>
            <h1 className='text-2xl font-bold'>Abstract</h1>
            <p>This article is a list of terms and their definitions.</p>
            <br />
            <h1 className='text-2xl font-bold'>Introduction</h1>
            <p>This article is a list of terms and their definitions.</p>
            <br />
            <h1 className='text-2xl font-bold'>Methods</h1>
            <p>This article is a list of terms and their definitions.</p>
            <br />
            <h1 className='text-2xl font-bold'>Results</h1>
            <p>This article is a list of terms and their definitions.</p>
        </div>
    )
}

export default article