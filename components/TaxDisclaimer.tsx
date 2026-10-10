export const SCOPE_DISCLAIMER =
  'Estimate based on published Revenue and DSP rates for the selected year. Covers employees, sole traders and common credits. Estimate only, not financial or tax advice. Check complex cases with Revenue.';

export function TaxDisclaimer({ className = '' }: { className?: string }) {
  return (
    <p className={`text-sm text-ink-muted ${className}`}>
      Based on published Irish tax bands; not advice. {SCOPE_DISCLAIMER}
    </p>
  );
}
