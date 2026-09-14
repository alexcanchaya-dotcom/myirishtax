/**
 * Card checkout is off until Stripe price IDs and a real secret key are set
 * and NEXT_PUBLIC_STRIPE_ENABLED=true. Premium upgrade buttons must stay
 * disabled while this is false so they do not go nowhere.
 */
export function isStripeCheckoutEnabled(): boolean {
  return process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'true';
}
