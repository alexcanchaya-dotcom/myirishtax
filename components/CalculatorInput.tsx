'use client';
import React, { useEffect, useId, useState } from 'react';
import { parseAmount } from '@/lib/parseAmount';

export { parseAmount };

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  hint?: string;
  id?: string;
  /** 'decimal' (default) for money; 'numeric' for whole numbers such as age or years. */
  inputMode?: 'decimal' | 'numeric';
};

function toRaw(value: number): string {
  return Number.isFinite(value) ? String(value) : '';
}

// type="text" (not "number") so the box can be empty and accepts "60,000" or "€60,000";
// inputMode still brings up the number keypad on phones.
export function CalculatorInput({ label, value, onChange, prefix, hint, id, inputMode = 'decimal' }: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const [raw, setRaw] = useState(() => toRaw(value));

  // Follow outside changes (reset, URL, other fields) without fighting what is being typed.
  useEffect(() => {
    setRaw((current) => (parseAmount(current) === value ? current : toRaw(value)));
  }, [value]);

  return (
    <div className="flex flex-col gap-1.5 text-sm font-medium text-ink">
      <label htmlFor={inputId}>{label}</label>
      <div className="flex items-center rounded-lg border border-line bg-paper px-3 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
        {prefix && <span className="mr-2 text-ink-muted" aria-hidden="true">{prefix}</span>}
        <input
          id={inputId}
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          enterKeyHint="done"
          aria-describedby={hintId}
          className="w-full bg-transparent py-3 text-base text-ink outline-none"
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            onChange(parseAmount(e.target.value));
          }}
          onBlur={() => {
            if (raw.trim() !== '') setRaw(toRaw(parseAmount(raw)));
          }}
        />
      </div>
      {hint && (
        <p id={hintId} className="text-xs font-normal leading-snug text-ink-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
