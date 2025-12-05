import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';

const schema = z.object({ plan: z.string().default('premium') });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', { apiVersion: '2024-06-20' as any });

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID || 'price_placeholder', quantity: 1 }],
    success_url: 'https://myirishtax.com/success',
    cancel_url: 'https://myirishtax.com/cancel',
    metadata: { plan: parsed.data.plan },
  });

  return NextResponse.json({ url: session.url });
}
