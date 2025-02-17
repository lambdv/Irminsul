import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@/app/(auth)/auth';

export async function POST(request: Request) {
    try {
        const { priceId } = await request.json();
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized - must be logged in' }, { status: 401 });
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            customer_email: session.user.email,
            return_url: `${request.headers.get('origin')}/return?session_id={CHECKOUT_SESSION_ID}`,
        });

        return NextResponse.json({ id: checkoutSession.id, client_secret: checkoutSession.client_secret });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}