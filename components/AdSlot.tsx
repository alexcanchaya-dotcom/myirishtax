'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Script from 'next/script';
import { adsConfig, publicAdsEnv, type AdSlotName } from '@/lib/ads';
import { readConsent, subscribeConsent } from '@/lib/consent';

/**
 * Ad slot. Renders NOTHING and loads no script unless ads are enabled, a client id and slot id exist,
 * AND the user accepted in the ConsentBanner. Never place inside or above a calculator form or result.
 */
export function AdSlot({ slot, env }: { slot: AdSlotName; env?: Record<string, string | undefined> }) {
  const cfg = adsConfig(env ?? publicAdsEnv());
  const slotId = cfg?.slots[slot];
  const consented =
    useSyncExternalStore(subscribeConsent, () => readConsent(), () => null) === 'granted' && Boolean(cfg && slotId);
  useEffect(() => {
    if (!consented) return;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      /* ignore */
    }
  }, [consented]);
  if (!cfg || !slotId || !consented) return null;
  return (
    <div className="my-8" data-testid="ad-slot">
      <p className="mb-1 text-xs text-ink-muted">Advertisement</p>
      <Script
        id="adsbygoogle-js"
        strategy="afterInteractive"
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cfg.clientId}`}
      />
      <ins className="adsbygoogle block" data-ad-client={cfg.clientId} data-ad-slot={slotId} data-ad-format="auto" data-full-width-responsive="true" />
    </div>
  );
}
