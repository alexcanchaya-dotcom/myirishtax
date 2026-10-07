'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

/** Small Sign in / Create account links in the footer (moved out of the main header). */
export function FooterAccountLinks() {
  const { status } = useSession();
  if (status === 'authenticated') return null;
  return (
    <p className="mt-6 text-xs text-ink-muted">
      Saving estimates is optional:{' '}
      <Link href="/auth/login" className="underline decoration-line underline-offset-2 hover:text-ink">
        Sign in
      </Link>{' '}
      ·{' '}
      <Link href="/auth/signup" className="underline decoration-line underline-offset-2 hover:text-ink">
        Create account
      </Link>
    </p>
  );
}
