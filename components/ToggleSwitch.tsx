'use client';
import React from 'react';

type Props = {
  enabled: boolean;
  onChange: (value: boolean) => void;
  label?: string;
};

export function ToggleSwitch({ enabled, onChange, label }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      className={`inline-flex items-center rounded-full border px-2 py-1 text-sm ${
        enabled ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700'
      }`}
    >
      <span className={`mr-2 h-4 w-4 rounded-full bg-white shadow ${enabled ? 'translate-x-3' : ''}`} />
      {label}
    </button>
  );
}
