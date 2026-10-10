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

describe('no affiliate links, #Ad slots or ad code (Mark, 7 Oct)', () => {
  it('ad and affiliate components and the dead static ad pages/scripts are gone', () => {
    for (const f of [
      'components/AdSlot.tsx',
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

  it('no ad slot, AdSense, affiliate or #Ad markup in app, components, lib or public', () => {
    const files = ['app', 'components', 'lib', 'public'].flatMap((d) => walk(join(root, d)));
    const bad = files.filter((f) =>
      /data-ad-slot|adsbygoogle|googlesyndication|AffiliateCTA|AdSlot|#Ad\b|rel="sponsored"/.test(readFileSync(f, 'utf8')),
    );
    expect(bad).toEqual([]);
  });
});
