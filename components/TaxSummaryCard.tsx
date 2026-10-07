import React from 'react';
import { TaxBreakdown } from '../lib/taxEngine';
import { buildSummaryRows } from '../lib/summaryRows';

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
  const rows = buildSummaryRows(data);
  return (
    <div className={`card ${isCurrent ? '' : 'opacity-60'}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          {data.household ? 'Household take-home pay' : 'Take-home pay'}
          {taxYear ? <span className="mt-0.5 block font-medium normal-case tracking-normal">{taxYear} tax year</span> : null}
        </p>
        <p className={`text-xs font-medium ${isCurrent ? 'text-brand-700' : 'text-ink-muted'}`}>
          {isCurrent ? 'Current estimate' : 'Out of date — click Calculate'}
        </p>
      </div>
      <p className="mt-2 font-serif text-4xl text-brand-700">{money(rows.takeHome)}</p>
      <p className="mt-1 text-sm text-ink-muted">
        {money(data.netMonthly)} a month · {money(data.netWeekly)} a week
      </p>
      {data.household && (
        <p className="mt-2 text-xs text-ink-muted">
          You and your spouse or partner together: {money(data.household.yourIncome)} +{' '}
          {money(data.household.spouseIncome)}. 20% band {money(data.household.standardRateBand)} (includes{' '}
          {money(data.household.bandIncrease)} second-earner increase).
        </p>
      )}
      <dl className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
        <Row label={data.household ? 'Gross pay (both of you)' : 'Gross pay'} value={money(rows.gross)} />
        <Row label="Income tax before credits" value={money(rows.incomeTaxBeforeCredits)} />
        <Row label="Less tax credits" value={`−${money(rows.creditsUsed)}`} indent valueClass="text-green-700" />
        <Row label="Income tax" value={money(rows.incomeTax)} />
        <Row label="USC" value={money(rows.usc)} />
        <Row label="PRSI" value={money(rows.prsi)} />
        <Row label="Total tax, USC and PRSI" value={money(rows.totalDeductions)} strong rule />
        {rows.pension > 0 && (
          <Row
            label={`Pension contribution (income tax relief on ${money(data.pension.relieved)})`}
            value={`−${money(rows.pension)}`}
          />
        )}
        <Row label="Take-home" value={money(rows.takeHome)} strong rule />
      </dl>
    </div>
  );
}

function Row({
  label,
  value,
  indent = false,
  strong = false,
  rule = false,
  valueClass = '',
}: {
  label: string;
  value: string;
  indent?: boolean;
  strong?: boolean;
  rule?: boolean;
  valueClass?: string;
}) {
  return (
    <div className={`flex justify-between gap-4 ${rule ? 'border-t border-line pt-2' : ''} ${strong ? 'font-medium' : ''}`}>
      <dt className={`${strong ? '' : 'text-ink-muted'} ${indent ? 'pl-4' : ''}`}>{label}</dt>
      <dd className={`tabular-nums ${valueClass}`}>{value}</dd>
    </div>
  );
}
