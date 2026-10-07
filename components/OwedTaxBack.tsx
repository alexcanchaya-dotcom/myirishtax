import React from 'react';

const REVIEW_YOUR_TAX = 'https://www.revenue.ie/en/online-services/services/myaccount/help-guides/quick-steps-to-complete-an-online-review-of-your-taxes.aspx';
const PAYE_RETURN = 'https://www.revenue.ie/en/jobs-and-pensions/end-of-year-process/paye-income-tax-return.aspx';

/**
 * "Owed tax back?" — the free Revenue route to claim overpaid income tax or USC for the last 4 years.
 * Plain links to revenue.ie only (no affiliate links, no tracking). Reusable on Form 12, small benefit and couples pages.
 */
export function OwedTaxBack({ className = '' }: { className?: string }) {
  const year = new Date().getFullYear();
  return (
    <aside aria-labelledby="owed-tax-back-heading" className={`card text-sm leading-relaxed text-ink-muted ${className}`}>
      <h2 id="owed-tax-back-heading" className="text-base font-semibold text-ink">
        Owed tax back?
      </h2>
      <p className="mt-2">
        If you paid too much income tax or USC, you can claim it back from Revenue yourself, for free. Sign in to{' '}
        <strong className="font-medium text-ink">myAccount</strong>, go to{' '}
        <strong className="font-medium text-ink">PAYE Services</strong> and click{' '}
        <strong className="font-medium text-ink">‘Review your tax for the previous 4 years’</strong>. Pick the year,
        select ‘Request’ and complete the PAYE Income Tax Return. In {year} you can claim for {year - 4} to {year - 1}.
      </p>
      <p className="mt-2">
        Revenue:{' '}
        <a href={REVIEW_YOUR_TAX} className="underline decoration-line underline-offset-2 hover:text-ink" target="_blank" rel="noopener noreferrer">
          Reviewing your taxes
        </a>{' '}
        ·{' '}
        <a href={PAYE_RETURN} className="underline decoration-line underline-offset-2 hover:text-ink" target="_blank" rel="noopener noreferrer">
          PAYE Income Tax Return
        </a>
      </p>
      <p className="mt-2 text-xs">Estimate only, not financial or tax advice.</p>
    </aside>
  );
}
