import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '..', '..');
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?|html|mjs)$/.test(name)) out.push(p);
  }
  return out;
}

// Updated 23 Oct 2026 (Al: scaffold monetisation behind flags that default OFF). Ad/affiliate markup may live
// ONLY in the flag-gated files below; those files have their own tests proving they render nothing when off.
const FLAGGED = [
  'components/AffiliateRefundCTA.tsx',
  'lib/monetisation/',
  'components/AdSlot.tsx',
  'components/ConsentBanner.tsx',
  'lib/ads.ts',
  'app/ads.txt/',
];

describe('no affiliate links, #Ad slots or ad code outside the flag-gated components', () => {
  it('ad and affiliate components and the dead static ad pages/scripts are gone', () => {
    for (const f of [
      'components/AffiliateCTA.tsx',
      'public/index.html',
      'public/styleguide.html',
      'public/assets/js/main.min.js',
      'public/assets/js/tracking.js',
      'public/assets/js/calculator.js',
    ]) {
      expect(existsSync(join(root, f))).toBe(false);
    }
  });

  it('no ad slot, AdSense, affiliate or #Ad markup in app, components, lib or public (outside FLAGGED)', () => {
    const files = ['app', 'components', 'lib', 'public']
      .flatMap((d) => walk(join(root, d)))
      .filter((f) => !FLAGGED.some((g) => f.slice(root.length + 1).replace(/\\/g, '/').startsWith(g)));
    const bad = files.filter((f) =>
      /data-ad-slot|adsbygoogle|googlesyndication|AffiliateCTA|AdSlot|#Ad\b|rel="sponsored"/.test(readFileSync(f, 'utf8')),
    );
    expect(bad).toEqual([]);
  });
});
