import React from 'react';
import { TaxBreakdown } from '../lib/taxEngine';

function money(n: number): string {
  return `€${Math.round(n).toLocaleString('en-IE')}`;
}

export function TaxSummaryCard({
  data,
  isCurrent = true,
  taxYear,
}: {
  data: TaxBreakdown;
  isCurrent?: boolean;
  taxYear?: number;
}) {
  return (
    <div className={`card ${isCurrent ? '' : 'opacity-60'}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Take-home pay
          {taxYear ? <span className="mt-0.5 block font-medium normal-case tracking-normal">{taxYear} tax year</span> : null}
        </p>
        <p className={`text-xs font-medium ${isCurrent ? 'text-brand-700' : 'text-ink-muted'}`}>
          {isCurrent ? 'Current estimate' : 'Out of date — click Calculate'}
        </p>
      </div>
      <p className="mt-2 font-serif text-4xl text-brand-700">{money(data.netAnnual)}</p>
      <p className="mt-1 text-sm text-ink-muted">
        {money(data.netMonthly)} a month · {money(data.netWeekly)} a week
      </p>
      <dl className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">PAYE after credits</dt>
          <dd>{money(data.payeAfterCredits)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">USC</dt>
          <dd>{money(data.uscTotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">PRSI</dt>
          <dd>{money(data.prsi)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Credits used (income tax only)</dt>
          <dd>{money(Math.min(data.credits, data.payeBeforeCredits))}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-line pt-2 font-medium">
          <dt>Total deductions</dt>
          <dd>{money(data.totalTax)}</dd>
        </div>
      </dl>
    </div>
  );
}
