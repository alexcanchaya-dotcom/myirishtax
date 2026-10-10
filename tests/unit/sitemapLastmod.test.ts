import fs from 'fs';
import path from 'path';
import { pageMeta } from '../../lib/pageMeta';

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');

describe('sitemap lastmod and /rental-calculator noindex', () => {
  const xml = read('public/sitemap.xml');
  const urls = xml.match(/<url>.*?<\/url>/g) ?? [];

  it('every sitemap URL has a YYYY-MM-DD lastmod no later than today', () => {
    expect(urls.length).toBe(16);
    for (const u of urls) {
      const m = u.match(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/);
      expect(m).not.toBeNull();
      expect(m![1] <= '2026-10-10').toBe(true);
    }
    expect(xml).toContain('<loc>https://myirishtax.com/exit-tax-ireland</loc><lastmod>2026-10-07</lastmod>');
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
