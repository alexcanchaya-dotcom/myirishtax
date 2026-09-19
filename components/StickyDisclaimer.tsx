import Link from 'next/link';

export function StickyDisclaimer() {
  return (
    <p className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 px-4 py-2 text-center text-[11px] leading-snug text-ink-muted backdrop-blur">
      Based on published Irish tax bands; not advice.{' '}
      <Link href="/disclaimer" className="underline decoration-line underline-offset-2 hover:text-ink">
        Disclaimer
      </Link>
    </p>
  );
}
