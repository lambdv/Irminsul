"use server"
import { accountsTable } from "@/db/schema/account"
import { auth, signOut } from "../auth"
import db from "@/db/db"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { commentsTable } from "@/db/schema/comment"
import { sessionsTable } from "@/db/schema/session"
import { usersTable } from "@/db/schema/user"
import { aitokenTable } from "@/db/schema/aitoken"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export async function changeUsername(newUsername: string) {
    const session = await auth()
    if (!session)
        return { error: 'Unauthorized' }
    //drizzle
    console.log(newUsername)
}

export async function purgeSessions() {
    const session = await auth()
    if (!session)
        return { error: 'Unauthorized' }

    await db.delete(sessionsTable).where(eq(sessionsTable.userId, session.user.id))
}

export async function purgeComments() {
    const session = await auth()
    if (!session)
        return { error: 'Unauthorized' }

    await db.update(commentsTable).set({
        userId: "-1"
    }).where(eq(commentsTable.userId, session.user.id))
}




export async function deleteAccount() {
    const session = await auth()
    if (!session)
        return { error: 'Unauthorized' }

    await purgeComments()
    await purgeSessions()

    //delete ai tokens  
    await db.delete(aitokenTable).where(eq(aitokenTable.userId, session.user.id))
        
    await db.delete(accountsTable).where(eq(accountsTable.userId, session.user.id))
    await db.delete(usersTable).where(eq(usersTable.id, session.user.id))

    redirect('/')
}




// export async function purgeComment(commentId: string) {
//     await db.update(commentsTable).set({
//         userId: "-1"
//     }).where(eq(commentsTable.id, commentId))   
// }
