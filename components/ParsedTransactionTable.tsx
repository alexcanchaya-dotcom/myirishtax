import React from 'react';
import { NormalisedTransaction } from '../lib/normalisers/types';

type Props = {
  items: NormalisedTransaction[];
};

export function ParsedTransactionTable({ items }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-3 py-2 text-left">Date</th>
            <th className="px-3 py-2 text-left">Type</th>
            <th className="px-3 py-2 text-left">Amount</th>
            <th className="px-3 py-2 text-left">Source</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-gray-100">
              <td className="px-3 py-2">{item.date}</td>
              <td className="px-3 py-2 capitalize">{item.type.replace('_', ' ')}</td>
              <td className="px-3 py-2">€{item.amount?.toFixed(2) ?? '—'}</td>
              <td className="px-3 py-2">{item.source ?? 'n/a'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
