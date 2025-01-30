import CommentSectionCSS from "./commentsection.module.css"
import db from "@/db/db"
// import { commentsTable, usersTable } from "@/db/schema"
import { commentsTable } from "@/db/schema/comment"
import { usersTable } from "@/db/schema/user"
import { eq, type InferInsertModel } from "drizzle-orm"
import { auth } from "@/app/(auth)/auth"
import Image from "next/image"
import { revalidatePath } from "next/cache"
import Btn from "./Btn"
import { redirect } from "next/navigation"
import { format } from "timeago.js"
import Link from "next/link"
import { Suspense } from "react"

export default async function CommentSection(props: {
    pageID: string,
    color?: string,
    owner?: string
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
                unoptimized
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
                        owner={props.owner}
                    />
            ))}
        </ul>
    </div>
    )
}


async function getComments(pageID: string): Promise<any[]> {
    "use server"
    const comments = await db.select()
        .from(commentsTable)
        .where(eq(commentsTable.page, pageID))
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

    await db.insert(commentsTable).values({
        page: pageID,
        userId: user.id,
        comment: comment,
        createdAt: new Date()
    })
    revalidatePath("/")
}

async function Comment(props: {comment: any, owner?: string}) {
    const commentUser = await db.select().from(usersTable).where(eq(usersTable.id, props.comment.userId))
    const session = await auth()
    const currentUser = session?.user
    const relativeDate = format(props.comment.createdAt)

    const commentUserIsOwnerOfCommentSection = props.comment.userId === props.owner || props.owner !== undefined
    
    const handleDeleteComment = async () => {
        "use server"
        await db.delete(commentsTable).where(eq(commentsTable.id, props.comment.id))
        revalidatePath("/")
    }

    return (
        <div className="flex flex-row gap-2 rounded-md mb-5">
            <Image src={commentUser[0].image} alt="User Avatar" width={100} height={100} className={CommentSectionCSS.commentUserAvatar} unoptimized/>
            <div className="flex flex-col">
                <div className="flex flex-row gap-2">
                    <h1 style={{fontWeight: "600"}}>
                        {commentUser[0].name}
                        {commentUser[0].id === "d4882fcc-8326-4fbb-8b32-d09c0fb86875" && (
                            <span style={{fontSize: "16px", top: "2px", userSelect: "none"}} className="material-symbols-rounded ml-1 relative" title="Verified">verified</span>
                        )}
                        {commentUserIsOwnerOfCommentSection && (<span style={{color: "#FFD700", fontSize: "13px"}}>  (OP)</span>)}

                    </h1>
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