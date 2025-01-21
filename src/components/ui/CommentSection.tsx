import CommentSectionCSS from "./commentsection.module.css"
import db from "@/db/db"
import { commentsTableBG, usersTablePG } from "@/db/schema"
import { eq, type InferInsertModel } from "drizzle-orm"
import { auth } from "@/app/(auth)/auth"
import Image from "next/image"
import { revalidatePath } from "next/cache"
import Btn from "./Btn"
import { redirect } from "next/navigation"
import { format } from "timeago.js"
import Link from "next/link"

export default async function CommentSection(props: {
    pageID: string,
    color?: string
}, searchParams: {page: string}) {
    let comments = await getComments(props.pageID)
    comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const numberOfComments = comments.length
    const session = await auth()
    const user = session?.user || null
    const page = Number(await searchParams?.page ?? "1")

    const handleCommentSubmit = async (formData: FormData) => {
        "use server"
        if(!user || user === null)
            redirect("/login")
        const comment: string = formData.get("comment") as string
        await postComment(props.pageID, comment)
    }

    return (
        <div className={CommentSectionCSS.commentSectionContainer} id="comments">
            <h1>{numberOfComments} Comments</h1>
            <div className={`${CommentSectionCSS.commentTextAreaContainer} flex flex-row mb-5`}>
                <Image 
                    src={user ? user.image : "/imgs/icons/defaultavatar.png"} 
                    alt="User Avatar" 
                    width={100} 
                    height={100} 
                    className={CommentSectionCSS.commentUserAvatar}
                />
                <form className="flex flex-col gap-2 w-full" action={handleCommentSubmit}>
                    <input
                        name="comment"
                        placeholder="Add a comment..." 
                        className={CommentSectionCSS.commentTextArea}
                        style={{resize: "none"}}
                        required
                        autoComplete="off"
                        // Event handlers need to be in a client component
                    />
                    {/* <div className="flex flex-row justify-end gap-2">
                        <Btn type="button">Cancel</Btn>
                        <Btn type="submit" style={{backgroundColor: props.color || "blue"}}>Comment</Btn>
                    </div> */}
                </form>
            </div>

            <ul>
                {comments
                    .map((comment) => (
                        <Comment 
                            key={comment.id}
                            comment={comment}
                        />
                ))}
            </ul>
        </div>
    )
}


async function getComments(pageID: string): Promise<any[]> {
    "use server"
    const comments = await db.select()
        .from(commentsTableBG)
        .where(eq(commentsTableBG.page, pageID))
    return comments
}

async function postComment(pageID: string, comment: string) {
    "use server"
    const session = await auth()
    const user = session?.user || null

    if(!user)
        throw new Error("User not found")
    
    if(comment.length === 0)
        throw new Error("Comment cannot be empty")

    if(comment.length > 1000)
        throw new Error("Comment cannot be longer than 1000 characters")

    if(comment.length < 1)
        throw new Error("Comment cannot be shorter than 1 character")

    if(comment === " ")
        throw new Error("Comment cannot be just spaces")

    await db.insert(commentsTableBG).values({
        page: pageID,
        userId: user.id,
        comment: comment,
        createdAt: new Date()
    })
    revalidatePath("/")
}

async function Comment(props: {comment: any}) {
    const commentUser = await db.select().from(usersTablePG).where(eq(usersTablePG.id, props.comment.userId))
    const session = await auth()
    const currentUser = session?.user
    const relativeDate = format(props.comment.createdAt)
    
    const handleDeleteComment = async () => {
        "use server"
        await db.delete(commentsTableBG).where(eq(commentsTableBG.id, props.comment.id))
        revalidatePath("/")
    }

    return (
        <div className="flex flex-row gap-2 rounded-md mb-5">
            <Image src={commentUser[0].image} alt="User Avatar" width={100} height={100} className={CommentSectionCSS.commentUserAvatar}/>
            <div className="flex flex-col">
                <div className="flex flex-row gap-2">
                    <h1>{commentUser[0].name}</h1>
                    <p>{relativeDate}</p>
                </div>
                <p>{props.comment.comment}</p>
                <div className="flex flex-row gap-2">
                    <Btn type="button">Reply</Btn>
                    {currentUser && props.comment.userId === currentUser.id && (
                        <form action={handleDeleteComment}>
                            <Btn type="submit">Delete</Btn>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}