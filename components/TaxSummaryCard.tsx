import React from 'react';
import { TaxBreakdown } from '../lib/taxEngine';

export function TaxSummaryCard({ data }: { data: TaxBreakdown }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800">Net income</h3>
      <p className="text-3xl font-bold text-brand-600">€{data.netAnnual.toFixed(0)}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
        <div>Monthly: €{data.netMonthly.toFixed(0)}</div>
        <div>Weekly: €{data.netWeekly.toFixed(0)}</div>
        <div>Daily: €{data.netDaily.toFixed(0)}</div>
        <div>Credits: €{data.credits.toFixed(0)}</div>
      </div>
    </div>
  );
}
