/**
 * AdSense config. OFF by default: returns null unless NEXT_PUBLIC_ADS_ENABLED === 'true' AND
 * NEXT_PUBLIC_ADSENSE_CLIENT_ID is a real-looking "ca-pub-<digits>" id. No id is invented here.
 * Vercel Hobby forbids ads, so only turn this on after the Cloudflare move (or Vercel Pro).
 */
type Env = Record<string, string | undefined>;

export type AdSlotName = 'inline' | 'footer';

export function adsConfig(env: Env) {
  if (env.NEXT_PUBLIC_ADS_ENABLED !== 'true') return null;
  const clientId = (env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? '').trim();
  if (!/^ca-pub-\d{10,20}$/.test(clientId)) return null;
  const slots: Partial<Record<AdSlotName, string>> = {};
  const inline = (env.NEXT_PUBLIC_ADSENSE_SLOT_INLINE ?? '').trim();
  const footer = (env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER ?? '').trim();
  if (/^\d+$/.test(inline)) slots.inline = inline;
  if (/^\d+$/.test(footer)) slots.footer = footer;
  return { clientId, slots };
}

/** Next.js only inlines NEXT_PUBLIC_* vars when referenced literally, so read them here. */
export function publicAdsEnv(): Env {
  return {
    NEXT_PUBLIC_ADS_ENABLED: process.env.NEXT_PUBLIC_ADS_ENABLED,
    NEXT_PUBLIC_ADSENSE_CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
    NEXT_PUBLIC_ADSENSE_SLOT_INLINE: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INLINE,
    NEXT_PUBLIC_ADSENSE_SLOT_FOOTER: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER,
  };
}

/** ads.txt line for Google, or null when ads are off / no id. f08c47fec0942fa0 is Google's published TAG id. */
export function adsTxt(env: Env): string | null {
  const cfg = adsConfig(env);
  if (!cfg) return null;
  return `google.com, ${cfg.clientId.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`;
}
