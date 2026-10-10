'use client';
import React, { useMemo, useState } from 'react';
import { CalculatorInput } from '@/components/CalculatorInput';
import { SelectField } from '@/components/SelectField';
import { compareYears, headlineWeekly, RENT_CREDIT } from '@/lib/budget/compareYears';

const eur = (n: number) => `€${Math.round(n).toLocaleString('en-IE')}`;
const eur2 = (n: number) => `€${n.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const signed = (n: number, f = eur) => (Math.abs(n) < 0.5 ? '€0' : `${n > 0 ? '+' : '−'}${f(Math.abs(n))}`);

/** Only rendered once Budget 2027 is confirmed (the page shows the pending line until then). */
export function Budget2027Compare() {
  const [income, setIncome] = useState(45000);
  const [status, setStatus] = useState<'single' | 'married'>('single');
  const [spouse, setSpouse] = useState(0);
  const [rent, setRent] = useState(false);
  const c = useMemo(
    () => compareYears({ income, maritalStatus: status, spouseIncome: spouse, rent }),
    [income, status, spouse, rent],
  );
  const rent27 = RENT_CREDIT[2027];

  const row = (label: string, a: number, b: number, minusIsGood = true) => (
    <tr className="border-b border-line">
      <td className="py-2 pr-3 text-ink-muted">{label}</td>
      <td className="py-2 pr-3 tabular-nums">{eur(a)}</td>
      <td className="py-2 pr-3 tabular-nums">{eur(b)}</td>
      <td className={`py-2 tabular-nums ${minusIsGood && b < a ? 'text-green-700' : ''}`}>{signed(b - a)}</td>
    </tr>
  );

  return (
    <section className="card" aria-labelledby="compare-heading" data-testid="budget-compare">
      <h2 id="compare-heading" className="text-xl font-semibold text-ink">2027 vs 2026: your take-home</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <CalculatorInput label="Your pay (per year)" value={income} onChange={setIncome} prefix="€" />
        <SelectField
          label="Marital status"
          value={status}
          onChange={(v) => setStatus(v as 'single' | 'married')}
          options={[
            { label: 'Single', value: 'single' },
            { label: 'Married or civil partners', value: 'married' },
          ]}
        />
        {status === 'married' && (
          <CalculatorInput
            label="Spouse or partner’s pay (per year)"
            value={spouse}
            onChange={setSpouse}
            prefix="€"
            hint="Leave at 0 if only one of you earns."
          />
        )}
        <label className="flex items-start gap-2 text-sm text-ink sm:col-span-2">
          <input type="checkbox" className="mt-1 h-4 w-4" checked={rent} onChange={(e) => setRent(e.target.checked)} />
          <span>
            I pay rent and claim the Rent Tax Credit
            {rent27 ? (
              <span className="block text-xs text-ink-muted">
                Full credit both years: €1,000 in 2026 and {eur(rent27.single)} in 2027 ({`€2,000`} and {eur(rent27.couple)}{' '}
                for a couple taxed jointly). Assumes rent of at least 5 times the credit.
              </span>
            ) : null}
          </span>
        </label>
      </div>

      <div className="mt-6 rounded-xl bg-paper px-4 py-4" aria-live="polite">
        <p className="font-serif text-2xl text-brand-700">You&apos;re {headlineWeekly(c.diff.week)}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {signed(c.diff.week, eur2)} a week · {signed(c.diff.month)} a month · {signed(c.diff.year)} a year
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-ink">
              <th className="py-2 pr-3 font-semibold">A year</th>
              <th className="py-2 pr-3 font-semibold">2026</th>
              <th className="py-2 pr-3 font-semibold">2027</th>
              <th className="py-2 font-semibold">Change</th>
            </tr>
          </thead>
          <tbody>
            {row('Income tax', c.before.incomeTax, c.after.incomeTax)}
            {row('USC', c.before.usc, c.after.usc)}
            {row('PRSI', c.before.prsi, c.after.prsi)}
            <tr className="font-medium text-ink">
              <td className="py-2 pr-3">Take-home</td>
              <td className="py-2 pr-3 tabular-nums">{eur(c.before.takeHome)}</td>
              <td className="py-2 pr-3 tabular-nums">{eur(c.after.takeHome)}</td>
              <td className="py-2 tabular-nums">{signed(c.diff.year)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        PRSI went from 4.2% to 4.35% on 1 October 2026, so 2027 has a full year at the higher rate (plus any 2027 change
        in the Budget 2027 documents). That is why PRSI can rise while income tax falls. Estimate only, not financial or
        tax advice.
      </p>
    </section>
  );
}
