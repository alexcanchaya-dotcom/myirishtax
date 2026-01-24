import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20' as any
});
const prisma = new PrismaClient();

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature') || '';
  const payload = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Get the subscription
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Determine tier from price ID
        const priceId = subscription.items.data[0].price.id;
        let tier = 'PREMIUM';
        if (priceId === process.env.STRIPE_PRICE_ID_PROFESSIONAL) {
          tier = 'PROFESSIONAL';
        }

        // Update user subscription
        await prisma.user.update({
          where: { email: session.customer_email! },
          data: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            subscriptionTier: tier,
            subscriptionStatus: 'active',
            subscriptionStart: new Date(subscription.current_period_start * 1000),
            subscriptionEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        console.log(`Subscription activated for ${session.customer_email}: ${tier}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        const priceId = subscription.items.data[0].price.id;
        let tier = 'PREMIUM';
        if (priceId === process.env.STRIPE_PRICE_ID_PROFESSIONAL) {
          tier = 'PROFESSIONAL';
        }

        await prisma.user.update({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            stripePriceId: priceId,
            subscriptionTier: tier,
            subscriptionStatus: subscription.status,
            subscriptionEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        console.log(`Subscription updated: ${subscription.id} - ${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.user.update({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            subscriptionTier: 'FREE',
            subscriptionStatus: 'cancelled',
          },
        });

        console.log(`Subscription cancelled: ${subscription.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        await prisma.user.update({
          where: { stripeCustomerId: invoice.customer as string },
          data: {
            subscriptionStatus: 'past_due',
          },
        });

        console.log(`Payment failed for customer: ${invoice.customer}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
