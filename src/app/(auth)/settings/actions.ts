"use server"
import { auth } from "../auth"
import db from "@/db/db"

export async function changeUsername(newUsername: string) {
    const session = await auth()
    if (!session) {
        return { error: 'Unauthorized' }
    }

    //drizzle

    console.log(newUsername)
}


