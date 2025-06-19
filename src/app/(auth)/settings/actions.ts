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
import { instanceOfCharacter } from "@root/src/types/character"

export async function changeUsername(newUsername: string) {
    const session = await auth()
    if (!session)
        return { error: 'Unauthorized' }
    //drizzle
    await db
        .update(usersTable)
        .set({
            [usersTable.name.name]: newUsername
        })
        .where(eq(usersTable.id, session.user.id));

    revalidatePath('/')
}

export async function clearAccountPfp() {
    const session = await auth()
    if (!session)
        return { error: 'Unauthorized' }
    
    await db.update(usersTable).set({
        [usersTable.image.name]: "/imgs/icons/defaultavatar.png"
    }).where(eq(usersTable.id, session.user.id))

    revalidatePath('/')

}

export async function changeAccountPfp(pfpUrl: string) {
    const session = await auth()
    if (!session)
        return { error: 'Unauthorized' }

    await db.update(usersTable).set({
        [usersTable.image.name]: pfpUrl
    }).where(eq(usersTable.id, session.user.id))

    revalidatePath('/')
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

export async function setApiAdaptorCookie(){
    const cookieStore = await cookies()
    const apiAdaptorCookie = cookieStore.get('apiAdaptor')
}

export async function setTheme(theme: 'light' | 'dark') {
    const cookieStore = await cookies()
    cookieStore.set('theme', theme, { path: '/' })
    revalidatePath('/')
}


export async function setLanguage(language: string) {
    const cookieStore = await cookies()
    cookieStore.set('language', language, { path: '/' })
    revalidatePath('/')
}

// export async function purgeComment(commentId: string) {
//     await db.update(commentsTable).set({
//         userId: "-1"
//     }).where(eq(commentsTable.id, commentId))   
// }

export async function validateCustomAPI(customAPI: string): Promise<boolean> {
    if(customAPI.includes("http")){
        try{
            const response = await fetch(customAPI)
            const data = await response.json()
            if(data.data.length > 0 && instanceOfCharacter(data.data[0]))
                return true;
        } 
        catch(e){
            return false;
        }
    }

    if(customAPI.includes("gd")){

        return true;
    }

    return false;
}

export async function setCustomAPI(customAPI: string): Promise<boolean> {


    const cookieStore = await cookies()
    cookieStore.set('customapi', customAPI, { path: '/' })

    return true
}

export async function clearCustomAPI() {
    const cookieStore = await cookies()
    cookieStore.delete('customapi')
}
