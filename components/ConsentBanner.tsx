'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { adsConfig, publicAdsEnv } from '@/lib/ads';
import { readConsent, subscribeConsent, writeConsent } from '@/lib/consent';

/** Shows only when ads are enabled (lib/ads) and no choice has been made. With ads off it renders nothing. */
export function ConsentBanner({ env }: { env?: Record<string, string | undefined> }) {
  const enabled = adsConfig(env ?? publicAdsEnv()) !== null;
  // Server snapshot 'unset-ssr' keeps the banner out of the static HTML; it appears after hydration if no choice.
  const choice = useSyncExternalStore(subscribeConsent, () => readConsent() ?? 'unset', () => 'unset-ssr');
  if (!enabled || choice !== 'unset') return null;
  const choose = (v: 'granted' | 'denied') => writeConsent(v);
  return (
    <div role="dialog" aria-live="polite" aria-label="Cookie choice" data-testid="consent-banner"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white p-4 text-sm text-ink shadow-lg">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          We&apos;d like to show ads from Google, which use cookies. The calculators work the same either way.{' '}
          <Link href="/cookies" className="underline underline-offset-2">Cookies</Link>
        </p>
        <div className="flex gap-2">
          <button type="button" className="btn-quiet min-h-[44px]" onClick={() => choose('denied')}>No thanks</button>
          <button type="button" className="btn-primary min-h-[44px]" onClick={() => choose('granted')}>Accept ads cookies</button>
        </div>
      </div>
    </div>
  );
}
