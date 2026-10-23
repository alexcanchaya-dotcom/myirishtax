/**
 * Refund-referral placements (Site Product plan, 23 Oct 2026). OFF by default.
 * Nothing renders unless BOTH are set at build time:
 *   NEXT_PUBLIC_AFFILIATE_ENABLED=true
 *   NEXT_PUBLIC_AFFILIATE_URL_TAXBACK=<partner tracking link>
 * Set them only once a partner deal exists. The free Revenue route (OwedTaxBack) always comes first.
 */
export type RefundPlacement = 'emergency-tax' | 'second-income' | 'rent-credit' | 'leaving-ireland' | 'paye-refund-check';

export const REFUND_CTA_TEXT: Record<RefundPlacement, string> = {
  'emergency-tax': 'Paid emergency tax? Get a refund check from a tax agent.',
  'second-income': 'Need help filing Form 12? A tax agent can do it for you.',
  'rent-credit': 'Not claimed rent credit for past years? Get it back with a tax agent.',
  'leaving-ireland': 'Leaving Ireland? A tax agent can claim your refund for you.',
  'paye-refund-check': 'Prefer someone else to do it? A tax agent can check your past 4 years.',
};

export const COMMISSION_NOTE = 'We may earn a commission if you use this service.';

type Env = Record<string, string | undefined>;

/** Returns the partner URL only when the flag is exactly "true" and the URL is a valid https link; else null. */
export function affiliateUrl(env: Env = process.env): string | null {
  if (env.NEXT_PUBLIC_AFFILIATE_ENABLED !== 'true') return null;
  const raw = (env.NEXT_PUBLIC_AFFILIATE_URL_TAXBACK ?? '').trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' ? u.toString() : null;
  } catch {
    return null;
  }
}
