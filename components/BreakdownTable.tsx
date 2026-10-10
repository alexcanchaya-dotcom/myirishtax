import React from 'react';
import { BandBreakdown } from '../lib/taxEngine';
import { formatBandLabel, formatCents, formatRate } from '../lib/bandLabel';

type Props = {
  title: string;
  rows: BandBreakdown[];
};

export function BreakdownTable({ title, rows }: Props) {
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="text-left text-ink-muted">
            <th className="pb-2 font-medium">Band</th>
            <th className="pb-2 font-medium">Rate</th>
            <th className="pb-2 text-right font-medium">Tax</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.band} className="border-t border-line">
              <td className="py-2">{formatBandLabel(row.band)}</td>
              <td>{formatRate(row.rate)}</td>
              <td className="text-right tabular-nums">{formatCents(row.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-line font-semibold text-ink">
            <td className="py-2" colSpan={2}>
              Total
            </td>
            <td className="text-right tabular-nums">{formatCents(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
