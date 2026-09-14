import { NextResponse } from 'next/server';

/**
 * Card checkout is off until Stripe is wired (keys, price IDs, and
 * NEXT_PUBLIC_STRIPE_ENABLED=true). This stub avoids loading NextAuth/Prisma
 * on a path that cannot take payments yet.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Card payments are not available yet' },
    { status: 503 }
  );
}
