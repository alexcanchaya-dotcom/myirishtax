'use client';

interface AdSlotProps {
  slotId: string;
  format?: 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
}

export function AdSlot({ slotId, format = 'horizontal', className = '' }: AdSlotProps) {
  // Placeholder for Google AdSense - renders nothing visible until AdSense is configured
  // To activate: Add AdSense script to layout.tsx <head>, then replace this with <ins> tag
  return (
    <div
      className={`ad-slot ${className}`}
      data-ad-slot={slotId}
      data-ad-format={format}
      aria-hidden="true"
    />
  );
}
