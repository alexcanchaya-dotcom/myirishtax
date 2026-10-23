import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdSlot } from '../../components/AdSlot';
import { ConsentBanner } from '../../components/ConsentBanner';
import { adsConfig, adsTxt } from '../../lib/ads';
import { GET } from '../../app/ads.txt/route';

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');
const ON = {
  NEXT_PUBLIC_ADS_ENABLED: 'true',
  NEXT_PUBLIC_ADSENSE_CLIENT_ID: 'ca-pub-1234567890123456',
  NEXT_PUBLIC_ADSENSE_SLOT_INLINE: '111',
};

describe('ads, consent banner and ads.txt are OFF by default', () => {
  it('config is null when the flag or a valid client id is missing', () => {
    expect(adsConfig({})).toBeNull();
    expect(adsConfig({ NEXT_PUBLIC_ADSENSE_CLIENT_ID: ON.NEXT_PUBLIC_ADSENSE_CLIENT_ID })).toBeNull();
    expect(adsConfig({ NEXT_PUBLIC_ADS_ENABLED: 'true' })).toBeNull();
    expect(adsConfig({ NEXT_PUBLIC_ADS_ENABLED: 'true', NEXT_PUBLIC_ADSENSE_CLIENT_ID: 'pub-XXXX' })).toBeNull();
    expect(adsConfig(ON)).toEqual({ clientId: 'ca-pub-1234567890123456', slots: { inline: '111' } });
  });

  it('AdSlot and ConsentBanner render nothing when off; AdSlot renders nothing before consent even when on', () => {
    expect(renderToStaticMarkup(React.createElement(AdSlot, { slot: 'inline', env: {} }))).toBe('');
    expect(renderToStaticMarkup(React.createElement(ConsentBanner, { env: {} }))).toBe('');
    expect(renderToStaticMarkup(React.createElement(AdSlot, { slot: 'inline', env: ON }))).toBe('');
    expect(renderToStaticMarkup(React.createElement(AdSlot, { slot: 'footer', env: ON }))).toBe('');
  });

  it('ads.txt: 404 with no env; Google line built from the env id when set (no invented id)', async () => {
    expect(adsTxt({})).toBeNull();
    expect(adsTxt(ON)).toBe('google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
    const res = GET();
    expect(res.status).toBe(404);
    expect(read('app/ads.txt/route.ts') + read('lib/ads.ts')).not.toMatch(/pub-\d{6,}/);
    expect(process.env.NEXT_PUBLIC_ADS_ENABLED).toBeUndefined();
  });

  it('banner is mounted once in the layout; ad script only inside AdSlot after consent', () => {
    expect(read('app/layout.tsx')).toContain('<ConsentBanner />');
    const slot = read('components/AdSlot.tsx');
    expect(slot).toContain("if (!cfg || !slotId || !consented) return null;");
    expect(read('app/layout.tsx')).not.toMatch(/googlesyndication|adsbygoogle/);
  });
});
