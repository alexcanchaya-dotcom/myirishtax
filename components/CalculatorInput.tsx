'use client';
import React from 'react';

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
};

export function CalculatorInput({ label, value, onChange, prefix }: Props) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
      {label}
      <div className="flex items-center rounded-lg border border-line bg-paper px-3 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
        {prefix && <span className="mr-2 text-ink-muted">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          className="w-full bg-transparent py-3 text-base text-ink outline-none"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </label>
  );
}
