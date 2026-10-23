import React from 'react';
import { COMMISSION_NOTE, REFUND_CTA_TEXT, affiliateUrl, type RefundPlacement } from '@/lib/monetisation/placements';

/**
 * Paid refund-agent link. Renders NOTHING (no link, no script, no tracking) unless the affiliate flag and
 * partner URL are both set. Labelled #Ad, rel="sponsored nofollow", commission note underneath.
 * Pass `env` only in tests.
 */
export function AffiliateRefundCTA({
  page,
  className = '',
  env,
}: {
  page: RefundPlacement;
  className?: string;
  env?: Record<string, string | undefined>;
}) {
  const href = affiliateUrl(env ?? {
    NEXT_PUBLIC_AFFILIATE_ENABLED: process.env.NEXT_PUBLIC_AFFILIATE_ENABLED,
    NEXT_PUBLIC_AFFILIATE_URL_TAXBACK: process.env.NEXT_PUBLIC_AFFILIATE_URL_TAXBACK,
  });
  if (!href) return null;
  return (
    <aside data-testid="affiliate-refund-cta" className={`card text-sm leading-relaxed text-ink-muted ${className}`}>
      <p>
        <span className="mr-2 rounded bg-paper px-1.5 py-0.5 text-xs font-semibold text-ink">#Ad</span>
        <a href={href} rel="sponsored nofollow noopener" target="_blank" className="font-medium text-ink underline underline-offset-2">
          {REFUND_CTA_TEXT[page]}
        </a>
      </p>
      <p className="mt-1 text-xs">{COMMISSION_NOTE} You can also claim for free in Revenue myAccount.</p>
    </aside>
  );
}
