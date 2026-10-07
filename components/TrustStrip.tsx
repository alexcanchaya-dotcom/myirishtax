import React from 'react';
import { DEFAULT_SOURCES, RATES_CHECKED, RATES_LABEL, type SourceLink } from '@/lib/config/siteRates';

/**
 * One line under each calculator / guide heading:
 * "Free calculator · {RATES_LABEL} · checked {RATES_CHECKED} · Sources: Revenue, gov.ie · Estimate only, not financial or tax advice"
 */
export function TrustStrip({
  kind = 'calculator',
  sources = DEFAULT_SOURCES,
  className = '',
}: {
  kind?: 'calculator' | 'guide';
  sources?: SourceLink[];
  className?: string;
}) {
  return (
    <p data-testid="trust-strip" className={`text-xs leading-snug text-ink-muted sm:text-sm ${className}`}>
      {kind === 'guide' ? 'Free guide' : 'Free calculator'} · {RATES_LABEL} · checked {RATES_CHECKED} · Sources:{' '}
      {sources.map((s, i) => (
        <React.Fragment key={s.href}>
          {i > 0 ? ', ' : null}
          <a
            href={s.href}
            className="underline decoration-line underline-offset-2 hover:text-ink"
            target="_blank"
            rel="noopener noreferrer"
          >
            {s.label}
          </a>
        </React.Fragment>
      ))}{' '}
      · <strong className="font-medium text-ink">Estimate only, not financial or tax advice</strong>
    </p>
  );
}
