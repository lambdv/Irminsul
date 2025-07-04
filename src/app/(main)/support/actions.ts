import { stripe } from "@/lib/stripe"
import db from "@/db/db"
import { purchasesTable } from "@/db/schema/purchase"
import { eq, desc } from "drizzle-orm"
import { getUserById } from "@/app/(auth)/actions"
import { usersTable } from "@/db/schema/user"
import { aitokenTable } from "@/db/schema/aitoken"

export async function syncStripePayments(){
    const payments = await stripe.paymentIntents.list()
    
    for(const payment of payments.data){
        
        const data = await db.select()
            .from(purchasesTable)
            .where(eq(purchasesTable.stripePaymentId, payment.id))
        const existingPayment = data[0]
        
        //if payment is already in the database and status is succeeded, then skip
        if(existingPayment && existingPayment.status === 'succeeded')
            continue

        //if payment is already in the database and status is not succeeded, then update the status to succeeded
        if(existingPayment && payment.status === 'succeeded' && existingPayment.status !== 'succeeded'){
            await db.update(purchasesTable)
                .set({ status: "succeeded" })
                .where(eq(purchasesTable.stripePaymentId, payment.id))
            await claimAiTokensFromPurchase(existingPayment)
        }
            
        //check if payment is already in the database via id using drizzle orm
        if(!existingPayment && payment.status === 'succeeded' && payment.receipt_email){
            const newPayment = await db
                .insert(purchasesTable)
                .values({
                    id: crypto.randomUUID(),
                    stripePaymentId: payment.id,
                    email: payment.receipt_email,
                    amount: payment.amount,
                    productId: 'supporter_tier',
                    productName: 'Supporter Tier',
                    createdAt: new Date(payment.created * 1000),
                    status: "succeeded"
                })
            await claimAiTokensFromPurchase(payment)
        }
    }
}

export const BASE_TIER_TOKEN_AMOUNT = 200
export const SUPPORT_TIER_TOKEN_AMOUNT = 500

async function claimAiTokensFromPurchase(payment: any) {
    console.log("payment", payment)

    // Check if the user exists based on the payment email
    const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, payment.receipt_email))
        .execute();

    if (user.length === 0) return;

    const userId = user[0].id;
    console.log("userId", userId)

    if(!userId) 
        return;

    const aitoken = await db
        .select()
        .from(aitokenTable)
        .where(eq(aitokenTable.userId, userId))
        .execute();

    if (aitoken.length > 0) {
        const aiToken = aitoken[0]
        // Update existing tokens
        await db.update(aitokenTable)
            .set({
                numTokens: aiToken.numTokens + SUPPORT_TIER_TOKEN_AMOUNT
            })
            .where(eq(aitokenTable.userId, userId));
    } 
    else {
        // Create new tokens entry only if userId is valid
        await db.insert(aitokenTable).values({
            userId: userId,
            numTokens: BASE_TIER_TOKEN_AMOUNT + SUPPORT_TIER_TOKEN_AMOUNT
        });
    }
}



export async function isUserSupporterByEmail(email: string){
    if(!email)
        return false

    const latestPurchaseFromUser = await db.select()
        .from(purchasesTable)
        .where(eq(purchasesTable.email, email))
        .orderBy(desc(purchasesTable.createdAt))
        .limit(1)
        .execute()
        .then(rows => rows[0]);

    if(!latestPurchaseFromUser) 
        return false

    //if the user has a purchase that is not expired (created at is less than a month ago)
    if(latestPurchaseFromUser 
        //&& latestPurchaseFromUser.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        && latestPurchaseFromUser.status === 'succeeded'
    )
        return true
    
    return false
}

export async function isUserSupporterById(id: string){
    const user = await getUserById(id)
    return isUserSupporterByEmail(user.email)
}
