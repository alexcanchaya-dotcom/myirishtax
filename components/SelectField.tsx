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
    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
      {label}
      <select
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
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
