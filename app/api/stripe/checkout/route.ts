import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

const schema = z.object({
  plan: z.enum(['premium', 'professional']),
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20' as any
});

export async function POST(request: Request) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const { plan } = parsed.data;

    // Determine price ID based on plan
    const priceId = plan === 'professional'
      ? process.env.STRIPE_PRICE_ID_PROFESSIONAL
      : process.env.STRIPE_PRICE_ID_PREMIUM;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not configured for this plan' },
        { status: 500 }
      );
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: session.user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?cancelled=true`,
      metadata: {
        userId: session.user.id,
        plan: plan,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
