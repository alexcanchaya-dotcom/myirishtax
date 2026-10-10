'use client';
import React, { useId } from 'react';

type Option = { label: string; value: string | number };

type Props = {
  label: string;
  value: string | number;
  options: Option[];
  onChange: (value: string) => void;
  hint?: string;
  className?: string;
  describedBy?: string;
  /** Keep the label for screen readers but hide it visually. */
  hideLabel?: boolean;
};

export function SelectField({ label, value, options, onChange, hint, className, describedBy, hideLabel = false }: Props) {
  const hintId = useId();
  const describedByIds = [hint ? hintId : null, describedBy].filter(Boolean).join(' ') || undefined;

  return (
    <label className={`flex min-w-0 flex-col gap-1.5 text-sm font-medium text-ink${className ? ` ${className}` : ''}`}>
      {hideLabel ? <span className="sr-only">{label}</span> : label}
      <select
        className={`field-control${hint || describedBy ? ' scroll-mb-[calc(var(--site-footer-offset)+6.75rem)]' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={describedByIds}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint ? (
        <span id={hintId} className="text-xs font-normal leading-snug text-ink-muted">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
