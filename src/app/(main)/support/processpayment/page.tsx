import { redirect } from 'next/navigation';
import { syncStripePayments } from '@root/src/app/(main)/support/actions';
import db from '@/db/db';
import { purchasesTable } from '@/db/schema/purchase';
import { eq } from 'drizzle-orm';
import { Suspense } from 'react';
import { getServerUser } from '@/lib/server-session';

export default async function ProcessPayment() {
    const user = await getServerUser();

    // Call the sync payments db server action
    await syncStripePayments();

    // Fetch payments from the database to check if the payment was successful
    const payments = await db.select().from(purchasesTable)
        .where(eq(purchasesTable.email, user?.email));

    if (payments.length > 0) {
        // Payment is successful
        return redirect('/'); // Redirect to home screen
    }

    return (
        <Suspense fallback={<div>Processing payment, Please wait...</div>}>
            <div>
                <h1>Thank you for your donation!</h1>
                <p>Your support helps us continue our work.</p>
            </div>
        </Suspense>
    );
}

