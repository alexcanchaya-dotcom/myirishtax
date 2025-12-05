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
    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
      {label}
      <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
        {prefix && <span className="mr-2 text-gray-500">{prefix}</span>}
        <input
          type="number"
          className="w-full outline-none"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </label>
  );
}
