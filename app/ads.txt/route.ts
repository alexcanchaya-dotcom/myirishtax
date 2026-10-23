import { adsTxt } from '@/lib/ads';

// ads.txt comes only from env (NEXT_PUBLIC_ADS_ENABLED + NEXT_PUBLIC_ADSENSE_CLIENT_ID). Unset → 404, no file.
export const dynamic = 'force-dynamic';

export function GET() {
  const body = adsTxt({
    NEXT_PUBLIC_ADS_ENABLED: process.env.NEXT_PUBLIC_ADS_ENABLED,
    NEXT_PUBLIC_ADSENSE_CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
  });
  if (!body) return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain' } });
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
