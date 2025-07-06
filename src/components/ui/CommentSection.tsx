import CommentSectionCSS from "./commentsection.module.css"
import db from "@/db/db"
// import { commentsTable, usersTable } from "@/db/schema"
import { commentsTable } from "@/db/schema/comment"
import { usersTable } from "@/db/schema/user"
import { eq, type InferInsertModel } from "drizzle-orm"
import Image from "next/image"
import { revalidatePath } from "next/cache"
import Btn from "./Btn"
import { redirect } from "next/navigation"
import { format } from "timeago.js"
import Link from "next/link"
import { Suspense } from "react"
import { isUserSupporterByEmail } from "@root/src/app/(main)/support/actions"
import CommentSectionClient from "./CommentSectionClient"
import { getServerSession, getServerUser } from "@/lib/server-session"

export default async function CommentSection(props: {
    pageID: string,
    color?: string,
    owner?: string
}, searchParams: {page: string}) {
    let comments = await getComments(props.pageID)
    comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const numberOfComments = comments.length
    const session = await getServerSession()
    const user = await getServerUser()

    // Enhance comments with user data and supporter status
    const enhancedComments = await Promise.all(comments.map(async (comment) => {
        const commentUser = await db.select().from(usersTable).where(eq(usersTable.id, comment.userId))
        const isSupporter = await isUserSupporterByEmail(commentUser[0].email)
        return {
            ...comment,
            user: commentUser[0],
            isSupporter
        }
    }))

    const handleCommentSubmit = async (comment: string) => {
        "use server"
        if(!user || user === null)
            redirect("/login")
        await postComment(props.pageID, comment)
    }

    const handleDeleteComment = async (commentId: string) => {
        "use server"
        await db.delete(commentsTable).where(eq(commentsTable.id, parseInt(commentId)))
        revalidatePath("/")
    }

    return (
        <CommentSectionClient
            user={user}
            numberOfComments={numberOfComments}
            comments={enhancedComments}
            pageID={props.pageID}
            color={props.color}
            owner={props.owner}
            onCommentSubmit={handleCommentSubmit}
            onDeleteComment={handleDeleteComment}
        />
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
    const user = await getServerUser()

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

// export async function Comment(props: {
//     comment: any, 
//     owner?: string,
//     options: boolean
// }) {
//     const commentUser = await db.select().from(usersTable).where(eq(usersTable.id, props.comment.userId))
//     const session = await auth()
//     const currentUser = session?.user
//     const relativeDate = format(props.comment.createdAt)

//     const commentUserIsOwnerOfCommentSection = props.comment.userId === props.owner || props.owner !== undefined
    
//     const handleDeleteComment = async () => {
//         "use server"
//         await db.delete(commentsTable).where(eq(commentsTable.id, props.comment.id))
//         //instead of delete, mutate the comment to be be remove traces tied to the user
//         // await db.update(commentsTable).set({
//         //     userId: "-1"
//         // }).where(eq(commentsTable.id, props.comment.id))
//         // revalidatePath("/")
//     }

//     const isSupporter = await isUserSupporterByEmail(commentUser[0].email)


//     return (
//         <div className="flex flex-row gap-2 rounded-md mb-5">
//             <Image src={commentUser[0].image} alt="User Avatar" width={100} height={100} className={CommentSectionCSS.commentUserAvatar} unoptimized={false}/>
//             <div className="flex flex-col">
//                 <div className="flex flex-row gap-2">
//                     <h1 style={{fontWeight: "600"}}>
//                         {commentUser[0].name}
//                         {(isSupporter) && (
//                             <span style={{fontSize: "16px", top: "2px", userSelect: "none"}} className="material-symbols-rounded ml-1 relative" title="Verified">verified</span>
//                         )}
//                         {/* {commentUserIsOwnerOfCommentSection && (<span style={{color: "#FFD700", fontSize: "13px"}}>  (OP)</span>)} */}

//                     </h1>
//                     <p>{relativeDate}</p>
//                 </div>
//                 <p>{props.comment.comment}</p>
//                 <div className="flex flex-row gap-2">
//                     {/* <Btn type="button">Reply</Btn> */}
//                     {currentUser && props.comment.userId === currentUser.id && props.options && (
//                         <form action={handleDeleteComment}>
//                             <Btn type="submit">Delete</Btn>
//                         </form>
//                     )}
//                 </div>
//             </div>
//         </div>
//     )
// }