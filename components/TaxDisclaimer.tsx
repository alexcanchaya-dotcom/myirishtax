export function TaxDisclaimer({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs text-gray-500 ${className}`}>
      Based on published Irish tax bands; not advice.
    </p>
  );
}
