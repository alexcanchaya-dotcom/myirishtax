'use client';
import React from 'react';

type Option = { label: string; value: string | number };

type Props = {
  label: string;
  value: string | number;
  options: Option[];
  onChange: (value: string) => void;
};

export function SelectField({ label, value, options, onChange }: Props) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
      {label}
      <select
        className="field-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
