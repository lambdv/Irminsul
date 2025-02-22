import { stripe } from "@/lib/stripe"
import db from "@/db/db"
import { purchasesTable } from "@/db/schema/purchase"
import { eq, desc } from "drizzle-orm"
import { getUserById } from "../(auth)/auth"

export async function syncStripePayments(){
    const payments = await stripe.paymentIntents.list()
    
    for(const payment of payments.data){
        const existingPayment = await db.select()
            .from(purchasesTable)
            .where(eq(purchasesTable.stripePaymentId, payment.id))
            .execute()
            .then(rows => rows[0]);
        
        //check if payment is already in the database via id using drizzle orm
        if(!existingPayment && payment.status === 'succeeded' && payment.receipt_email){
            const newPayment = await db.insert(purchasesTable).values({
                id: crypto.randomUUID(),
                stripePaymentId: payment.id,
                email: payment.receipt_email,
                amount: payment.amount,
                productId: 'supporter_tier',
                productName: 'Supporter Tier',
                createdAt: new Date(payment.created * 1000),
            })
        }

        //check if payment 
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
    if(latestPurchaseFromUser && latestPurchaseFromUser.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        return true
    
    return false
}

export async function isUserSupporterById(id: string){
    const user = await getUserById(id)
    return isUserSupporterByEmail(user.email)
}
