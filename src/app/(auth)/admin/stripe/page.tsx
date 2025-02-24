import { stripe } from '@/lib/stripe'; // Adjust the import based on your project structure
import db from '@/db/db';
import { purchasesTable } from '@/db/schema/purchase';
import { eq } from 'drizzle-orm';
import { isAdmin } from '../../auth';
import { redirect } from 'next/navigation';

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
                        <div key={payment.id}>
                            <h2>{payment.id}</h2>
                            <p>{payment.amount}</p>
                        </div>
                    ))
                ) : (
                    <p>No payments found</p>
                )}
            </div>


            <br />

            <h1>Internal DB purchases</h1>

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
            <p className="text-gray-500">{props.payment.createdAt.toString()}</p>
            <p className="text-gray-700">{props.payment.email}</p>
            <p className="text-gray-700">{props.payment.productId}</p>
            <p className="text-gray-700">{props.payment.productName}</p>
            <p className="text-gray-700">{props.payment.stripePaymentId}</p>
            <p className="text-gray-700">{props.payment.status}</p>
        </div>
    )
}
