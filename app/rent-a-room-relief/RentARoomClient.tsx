'use client';
import React, { useMemo, useState } from 'react';
import { CalculatorInput } from '@/components/CalculatorInput';
import { SelectField } from '@/components/SelectField';
import { RENT_A_ROOM_YEARS, checkRentARoom } from '@/lib/rentARoom';

const euro = (n: number) => `€${Math.round(n).toLocaleString('en-IE')}`;

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-11 items-start gap-3 text-sm text-ink">
      <input type="checkbox" className="mt-1 h-5 w-5" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function RentARoomClient() {
  const [year, setYear] = useState(2026);
  const [rent, setRent] = useState(9600);
  const [extras, setExtras] = useState(0);
  const [inYourHome, setInYourHome] = useState(true);
  const [childOrEmployer, setChildOrEmployer] = useState(false);
  const [shortTerm, setShortTerm] = useState(false);
  const r = useMemo(
    () => checkRentARoom({ year, rent, extras, inYourHome, tenantIsChildOrEmployer: childOrEmployer, shortTermGuests: shortTerm }),
    [year, rent, extras, inYourHome, childOrEmployer, shortTerm],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="card space-y-5 lg:col-span-7">
        <SelectField
          label="Tax year"
          value={year}
          onChange={(v) => setYear(Number(v))}
          options={RENT_A_ROOM_YEARS.map((y) => ({ label: String(y), value: y }))}
        />
        <CalculatorInput label="Rent received in the year" value={rent} onChange={setRent} prefix="€" />
        <CalculatorInput
          label="Meals, laundry and other charges"
          value={extras}
          onChange={setExtras}
          prefix="€"
          hint="Anything else the lodger pays you for. It counts towards the limit too."
        />
        <Check label="The room is in my own home (where I live)" checked={inYourHome} onChange={setInYourHome} />
        <Check label="The lodger is my child, or my employer" checked={childOrEmployer} onChange={setChildOrEmployer} />
        <Check
          label="Short-term guests (28 days or less, e.g. booking sites). Not students, digs or respite care."
          checked={shortTerm}
          onChange={setShortTerm}
        />
      </div>

      <div className="card lg:col-span-5" aria-live="polite" data-testid="rent-a-room-result">
        {r.status === 'exempt' && (
          <>
            <p className="text-lg font-semibold text-green-700">Likely tax-free</p>
            <p className="mt-2 text-sm text-ink-muted">
              {euro(r.gross)} is within the {euro(r.limit)} limit for {year}, with {euro(r.headroom)} to spare. No income
              tax, USC or PRSI on it. You still need to declare it on your tax return.
            </p>
          </>
        )}
        {r.status === 'over-limit' && (
          <>
            <p className="text-lg font-semibold text-amber-800">Over the limit: all of it is taxed</p>
            <p className="mt-2 text-sm text-ink-muted">
              {euro(r.gross)} is {euro(-r.headroom)} over the {euro(r.limit)} limit for {year}. The whole{' '}
              {euro(r.gross)} is taxed as rental income (less allowable expenses), not just the part over the limit.
            </p>
          </>
        )}
        {r.status === 'not-eligible' && (
          <>
            <p className="text-lg font-semibold text-amber-800">Rent-a-Room Relief does not apply</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-muted">
              {r.reasons.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </>
        )}
        <p className="mt-4 text-xs text-ink-muted">
          Married or civil partners taxed jointly share one limit. Estimate only, not financial or tax advice.
        </p>
      </div>
    </div>
  );
}
