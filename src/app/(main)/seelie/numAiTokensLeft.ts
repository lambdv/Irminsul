import { generateText, streamText, tool } from "ai";
import { getCharacterDataTool, getInformationFromKnowledgeBaseTool as getInformationTool } from "./tools";
import { eq, sql, and } from "drizzle-orm";
import db from "@/db/db";
import { aitokenTable } from "@/db/schema/aitoken";
import { usersTable } from "@/db/schema/user";

/**
 * Get the number of AI tokens left for a user
 * @param userId user id
 * @returns number of tokens left
 */
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
    
    //if there is are no record, create one
    if(tokenRecord.length <= 0 && user[0].email) 
        return await insertAiToken(userId, 20)
    
    let numTokens = tokenRecord[0].numTokens
    return Math.max(numTokens, 0)
}

/**
 * Insert a new AI token record for a user
 * @param userId user id
 * @param numTokens number of tokens
 * @returns number of tokens
 */
async function insertAiToken(userId: string, numTokens: number){
    await db.insert(aitokenTable).values({
        "userId": userId,
        "numTokens": numTokens
    })
    return numTokens
}
