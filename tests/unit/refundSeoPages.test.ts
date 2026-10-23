import fs from 'fs';
import path from 'path';
import { refundYears } from '../../lib/refundYears';

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');

describe.each([
  ['app/tax-back-leaving-ireland/page.tsx', '/tax-back-leaving-ireland', 'Tax back when leaving Ireland: how to claim your refund | MyIrishTax', 'leaving-ireland'],
  ['app/paye-refund-check/page.tsx', '/paye-refund-check', 'PAYE refund check: claim tax back for the past 4 years | MyIrishTax', 'paye-refund-check'],
])('%s', (file, route, title, key) => {
  const page = read(file);
  it('title, path, disclaimer, Revenue sources', () => {
    expect(page).toContain(`title: '${title}'`);
    expect(page).toContain(`path: '${route}'`);
    expect(page).toContain('<TaxDisclaimer />');
    expect(page).toContain('Estimate only; not financial or tax advice.');
    expect(page).toContain('https://www.revenue.ie/en/');
    expect(page).not.toMatch(/accountant|ACCA|accurate|precise|guaranteed|we recommend/i);
  });
  it('in sitemap, related links, menu; flag-gated CTA only', () => {
    expect(read('app/sitemap.ts')).toContain(`'${route}': '2026-10-23'`);
    expect(read('components/RelatedCalculators.tsx')).toContain(`href: '${route}'`);
    expect(read('components/NavBar.tsx')).toContain(`href: '${route}'`);
    expect(page).toContain(`<RelatedCalculators current="${key}" />`);
    expect(page).toContain(`<AffiliateRefundCTA page="${key}" />`);
  });
});

describe('refund window (Revenue: within four years after the end of the tax year)', () => {
  it('in 2026 you can claim 2022 to 2025; 2022 expires at year end', () => {
    expect(refundYears(2026)).toEqual({ first: 2022, last: 2025, expiring: 2022 });
  });
});
