import Terminology from "./_articles/terminology"

const mockart = {
    title: "Terminology2",
    description: "This is a test article",
    authorUserID: "d4882fcc-8326-4fbb-8b32-d09c0fb86875",
    date: "January 22, 2025", 
    slug: "terminology2",
    content: null,
    tableOfContents: [
      { title: "Character Roles", slug: "character-roles" },
    ]
  }

export function articles(){
    return [
        Terminology,
        mockart
    ]
}

// export type Article = {
//     title: string
//     description: string
//     authorUserID: string
//     date: string
//     slug: string
//     content: React.ReactNode
    
//     tags?: string[]
//     headerType?: "default" | "archive"
//     headerImageURL?: string
//     headerBGURL?: string
// }
