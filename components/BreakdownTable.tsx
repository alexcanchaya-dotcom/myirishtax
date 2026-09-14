import React from 'react';
import { BandBreakdown } from '../lib/taxEngine';

type Props = {
  title: string;
  rows: BandBreakdown[];
};

export function BreakdownTable({ title, rows }: Props) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="text-left text-ink-muted">
            <th className="pb-2 font-medium">Band</th>
            <th className="pb-2 font-medium">Rate</th>
            <th className="pb-2 font-medium">Tax</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.band} className="border-t border-line">
              <td className="py-2">{row.band}</td>
              <td>{(row.rate * 100).toFixed(1)}%</td>
              <td>€{row.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
