export function TaxDisclaimer({ className = '' }: { className?: string }) {
  return (
    <p className={`text-sm text-ink-muted ${className}`}>
      Based on published Irish tax bands; not advice.
    </p>
  );
}
