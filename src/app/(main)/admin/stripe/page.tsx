import { stripe } from '@/lib/stripe'; // Adjust the import based on your project structure
import db from '@/db/db';
import { purchasesTable } from '@/db/schema/purchase';
import { eq } from 'drizzle-orm';
import { isAdmin } from "@/app/(auth)/actions"
import { redirect } from 'next/navigation';
import { syncStripePayments } from '@root/src/app/(main)/support/actions';
import { aitokenTable } from '@/db/schema/aitoken';

export default async function AdminDashboard() {

    if(!await isAdmin())
        redirect("/")

    const payments = await stripe.paymentIntents.list()
    const internalPayments = await db.select()
        .from(purchasesTable)

    return (
        <div>
            <h1>Stripe DB purchases</h1>
            <div>
                {payments.data.length > 0 ? (
                    payments.data.map((payment) => (
                        <PaymentItem key={payment.id} payment={payment} />
                    ))
                ) : (
                    <p>No payments found</p>
                )}
            </div>


            <br />

            <h1>Internal DB purchases</h1>

            <div className="flex flex-row gap-2">
                <form action={async () => {
                    "use server"
                    await syncStripePayments()
                    redirect("/admin/stripe")
                }}>
                    <button type="submit" className="p-2 bg-blue-500 text-white rounded-md m-1">Sync Stripe Payments</button>
                </form>


                <form action={async () => {
                    "use server"
                    await db.delete(aitokenTable).execute()
                    await db.delete(purchasesTable).execute()
                    redirect("/admin/stripe")
                }}>
                    <button type="submit" className="p-2 bg-red-500 text-white rounded-md m-1">Clear AI Tokens and Purchases</button>
                </form>
            </div>

            <div>
                {internalPayments.length > 0 ? (
                    internalPayments.map((payment) => (
                        <PaymentItem key={payment.id} payment={payment} />
                    ))
                ) : (
                    <p>No payments found</p>
                )}
            </div>
        </div>
    );
};

function PaymentItem(props: {payment: any}){
    return (
        <div className="p-4 border rounded-lg shadow-md">
            <p className="text-lg font-semibold">{props.payment.amount}</p>
            {/* <p className="text-gray-500">{props.payment.createdAt.toString()}</p> */}
            <p className="text-gray-700">{props.payment.email || ""}</p>
            <p className="text-gray-700">{props.payment.receipt_email || ""}</p>

            <p className="text-gray-700">{props.payment.productId}</p>
            <p className="text-gray-700">{props.payment.productName}</p>
            <p className="text-gray-700">{props.payment.stripePaymentId}</p>
            <p className="text-gray-700">{props.payment.status}</p>
        </div>
    )
}
