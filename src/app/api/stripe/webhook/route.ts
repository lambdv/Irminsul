import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import db from '@/db/db';
import { purchasesTable } from '@/db/schema/purchase';
import { aitokenTable } from '@/db/schema/aitoken';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const webhookSecret = process.env.STRIPE_SECRET_KEY;

export async function POST(req: Request) {
  try {
    if (!webhookSecret) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    }

    const body = await req.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      return new NextResponse('No signature', { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const { userId, productId, productName, tokenAmount } = paymentIntent.metadata;

      // Record the successful purchase in the database
      await db.insert(purchasesTable).values({
        id: uuidv4(),
        userId: userId,
        stripePaymentId: paymentIntent.id,
        amount: paymentIntent.amount,
        productId: productId,
        productName: productName
      });

      // Update user's AI tokens
      const tokenAmountNum = parseInt(tokenAmount);
      if (tokenAmountNum) {
        // Try to get existing tokens first
        const existingTokens = await db.select().from(aitokenTable).where(eq(aitokenTable.userId, userId));
        
        if (existingTokens.length > 0) {
          // Update existing tokens
          await db
            .update(aitokenTable)
            .set({ 
              numTokens: existingTokens[0].numTokens + tokenAmountNum 
            })
            .where(eq(aitokenTable.userId, userId));
        } else {
          // Create new token record
          await db.insert(aitokenTable).values({
            userId,
            numTokens: tokenAmountNum
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse(
      'Webhook error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      { status: 400 }
    );
  }
} 