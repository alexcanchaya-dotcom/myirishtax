import React from 'react';
import { BandBreakdown } from '../lib/taxEngine';

type Props = {
  title: string;
  rows: BandBreakdown[];
};

export function BreakdownTable({ title, rows }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th>Band</th>
            <th>Rate</th>
            <th>Tax</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.band} className="border-t border-gray-100">
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
