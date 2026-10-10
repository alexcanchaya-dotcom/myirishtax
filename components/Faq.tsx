import React from 'react';

export type FaqItem = { q: string; a: string };

/**
 * Visible FAQ plus FAQPage JSON-LD built from the SAME items, so the structured data only ever says
 * what is on the page. Answers are plain text.
 */
export function Faq({ items, id = 'faq' }: { items: FaqItem[]; id?: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
  };
  return (
    <section aria-labelledby={`${id}-heading`} className="card mt-12">
      <h2 id={`${id}-heading`} className="text-lg font-semibold text-ink">
        Questions
      </h2>
      <div className="mt-4 divide-y divide-line">
        {items.map((i) => (
          <details key={i.q} className="group py-1">
            <summary className="cursor-pointer list-none py-3 font-medium text-ink">{i.q}</summary>
            <p className="pb-3 text-sm leading-relaxed text-ink-muted">{i.a}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </section>
  );
}

/** WebApplication JSON-LD for a free calculator page (name, URL and description must match the page). */
export function WebAppJsonLd({ name, path, description }: { name: string; path: string; description: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url: `https://myirishtax.com${path}`,
    description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />;
}
