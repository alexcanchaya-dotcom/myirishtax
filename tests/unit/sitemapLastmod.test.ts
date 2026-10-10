import fs from 'fs';
import path from 'path';
import { pageMeta } from '../../lib/pageMeta';

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');

describe('sitemap lastmod and /rental-calculator noindex', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const entries = (require('../../app/sitemap').default as () => { url: string; lastModified?: string }[])();
  const xml = entries.map((e) => e.url).join(' ');

  it('every sitemap URL has a YYYY-MM-DD lastmod no later than today', () => {
    expect(entries.length).toBeGreaterThanOrEqual(15);
    for (const e of entries) {
      expect(e.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.lastModified! <= '2026-10-10').toBe(true);
    }
    expect(entries.find((e) => e.url.endsWith('/exit-tax-ireland'))?.lastModified).toBe('2026-10-07');
  });

  it('/rental-calculator (coming soon) is noindex, follow, and not in the sitemap', () => {
    expect(read('app/rental-calculator/page.tsx')).toMatch(/path: '\/rental-calculator',\n  noindex: true,/);
    expect(pageMeta({ title: 't', description: 'd', path: '/rental-calculator', noindex: true }).robots).toEqual({ index: false, follow: true });
    expect(xml).not.toContain('/rental-calculator');
  });

  it('other pages stay indexable', () => {
    expect(pageMeta({ title: 't', description: 'd', path: '/x' }).robots).toBeUndefined();
  });
});
