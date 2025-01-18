'use server'

import db from "@/db/db";
import { usersTablePG } from "@/db/schema";
import { eq } from "drizzle-orm";


async function validateData(data: FormData){
    const username = data.get('username');
    const email = data.get('email');
    const password = data.get('password');

    //check if data is valid
    if(!username || !email || !password)
        return {error: "Invalid data"}

    //check if user exists
    const user = await db.select().from(usersTablePG).where(eq(usersTablePG.username, username?.toString()))
    if(user.length > 0)
        return {error: "User name taken"}

    //check if email exists
    const emailExists = await db.select().from(usersTablePG).where(eq(usersTablePG.email, email?.toString()))
    if(emailExists.length > 0)
        return {error: "Email already in use"}

    //check if password is valid
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if(!passwordRegex.test(password?.toString()))
        return {error: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"}

    //check if email is valid
    return {username, email, password}
}

export async function handleSignUpSubmit(data: FormData){
    //validate data
    const validatedData = await validateData(data)
    if(validatedData.error){
        return {error: validatedData.error}
    }
    


    //create user

    //create session


    console.log(validatedData)

}

