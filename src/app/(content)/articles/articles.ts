import Terminology from "./_articles/terminology"

export function articles(){
    return [
        Terminology
    ]
}

export type Article = {
    title: string
    description: string
    authorUserID: string
    date: string
    slug: string
    content: React.ReactNode
    
    tags?: string[]
    headerType?: "default" | "archive"
    headerImageURL?: string
    headerBGURL?: string
}
