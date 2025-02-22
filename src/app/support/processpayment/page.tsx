import { redirect } from 'next/navigation';
import { syncStripePayments } from '@/app/support/actions';
import { auth } from '@/app/(auth)/auth';
import db from '@/db/db';
import { purchasesTable } from '@/db/schema/purchase';
import { eq } from 'drizzle-orm';

export default async function ProcessPayment() {
    const session = await auth();

    // Call the sync payments db server action
    await syncStripePayments();

    // Fetch payments from the database to check if the payment was successful
    const payments = await db.select().from(purchasesTable)
        .where(eq(purchasesTable.email, session?.user?.email));

    if (payments.length > 0) {
        // Payment is successful
        return redirect('/'); // Redirect to home screen
    }

    return (
        <div>
            <h1>Thank you for your donation!</h1>
            <p>Your support helps us continue our work.</p>
        </div>
    );
}

