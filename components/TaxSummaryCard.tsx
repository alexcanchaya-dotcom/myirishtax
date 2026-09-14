import React from 'react';
import { TaxBreakdown } from '../lib/taxEngine';

export function TaxSummaryCard({ data }: { data: TaxBreakdown }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800">Take-home pay</h3>
      <p className="text-3xl font-bold text-brand-600">€{data.netAnnual.toFixed(0)}</p>
      <dl className="mt-3 space-y-1 text-sm text-gray-600">
        <div className="flex justify-between gap-4">
          <dt>PAYE after credits</dt>
          <dd>€{data.payeAfterCredits.toFixed(0)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>USC</dt>
          <dd>€{data.uscTotal.toFixed(0)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>PRSI</dt>
          <dd>€{data.prsi.toFixed(0)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Credits used (income tax only)</dt>
          <dd>€{Math.min(data.credits, data.payeBeforeCredits).toFixed(0)}</dd>
        </div>
        <div className="flex justify-between gap-4 font-medium text-gray-800">
          <dt>Total deductions</dt>
          <dd>€{data.totalTax.toFixed(0)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Monthly</dt>
          <dd>€{data.netMonthly.toFixed(0)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Weekly</dt>
          <dd>€{data.netWeekly.toFixed(0)}</dd>
        </div>
      </dl>
    </div>
  );
}
