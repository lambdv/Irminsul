import { stripe } from "@/lib/stripe"
import db from "@/db/db"
import { purchasesTable } from "@/db/schema/purchase"
import { eq, inArray } from "drizzle-orm"
import Divider from "@/components/ui/Divider"
import { syncStripePayments } from "@/app/support/actions"
export default async function Purchases() {

    const payments = await stripe.paymentIntents.list()

    const paymentsSavedinDB = await db.select()
        .from(purchasesTable)
        .where(inArray(purchasesTable.stripePaymentId, payments.data.map((payment) => payment.id)))

    const purchases = await db.select()
        .from(purchasesTable)


  return (
    <div>
        <Divider />

        <form action={async () => {
            "use server"
            await syncStripePayments()
        }}>
            <button type="submit" className="btn btn-primary btn-sm">Sync</button>
        </form>

        <Divider />
        <h1>Stripe Purchases</h1>

        {payments.data.map((payment) => (
            <div key={payment.id} className="border p-4 mb-4 rounded shadow-md">
                {paymentsSavedinDB.find(p => p.stripePaymentId === payment.id) ? (
                    <p className="text-green-500">Saved in DB</p>
                ) : (
                    <p className="text-red-500">Not saved in DB</p>
                )}
                <p className="font-bold text-lg">Payment ID: {payment.id}</p>
                <p className="text-gray-700">Amount: ${(payment.amount / 100).toFixed(2)}</p>
                <p className={`text-sm ${payment.status === 'succeeded' ? 'text-green-500' : 'text-red-500'}`}>
                    Status: {payment.status}
                </p>
                {/* <details>
                    <summary className="cursor-pointer">View JSON</summary>
                    <pre>{JSON.stringify(payment, null, 2)}</pre>
                </details> */}
            </div>
        ))}

        <Divider />
        <h1>Purchases in DB</h1>

        {purchases.map((purchase) => (
            <div key={purchase.id} className="border p-4 mb-4 rounded shadow-md">
                <p>{purchase.id}</p>
                <p>{purchase.email}</p>
                <p>{purchase.amount}</p>
            </div>
        ))}
        

    </div>
  )

}