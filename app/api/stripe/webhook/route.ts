import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', { apiVersion: '2024-06-20' as any });

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature') || '';
  const payload = await request.text();
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder');
    if (event.type === 'checkout.session.completed') {
      // Handle premium activation
      console.log('Premium checkout completed', event.data.object);
    }
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  return NextResponse.json({ received: true });
}
