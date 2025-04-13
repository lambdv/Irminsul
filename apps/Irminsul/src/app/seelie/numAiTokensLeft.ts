import { generateText, streamText, tool } from "ai";
import { getCharacterDataTool, getInformationTool } from "./tools";
import { eq, sql, and } from "drizzle-orm";
import db from "@/db/db";
import { aitokenTable } from "@/db/schema/aitoken";
import { usersTable } from "@/db/schema/user";

export async function getAiTokensLeft(userId: string){

    //get user from db
    const user = await db.select() 
        .from(usersTable)
        .where(eq(usersTable.id, userId))
    
    if(user.length <= 0)
        return 0

    const tokenRecord = await db.select()
        .from(aitokenTable)
        .where(eq(aitokenTable.userId, userId))
    
    //if there is a record, return the numTokens
    if(tokenRecord.length > 0 && user[0].email){
        let numTokens = tokenRecord[0].numTokens
        return Math.max(numTokens, 0)
    }
    else {
        //if there is no record, create one
        return await insertAiToken(userId, 20)
    }
}

async function insertAiToken(userId: string, numTokens: number){
    await db.insert(aitokenTable).values({
        "userId": userId,
        "numTokens": numTokens
    })
    return numTokens
}
