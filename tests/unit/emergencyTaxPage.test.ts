import fs from 'fs';
import path from 'path';

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');

describe('/emergency-tax-ireland guide', () => {
  const page = read('app/emergency-tax-ireland/page.tsx');
  it('has the SEO title, disclaimer, Revenue sources and internal links', () => {
    expect(page).toContain("title: 'Emergency tax in Ireland: why it happens and how to fix it | MyIrishTax'");
    expect(page).toContain("path: '/emergency-tax-ireland'");
    expect(page).toContain('<TaxDisclaimer />');
    expect(page).toContain('Estimate only; not financial or tax advice.');
    expect(page).toContain('href="/"');
    expect(page).toContain('href="/second-income-form-12"');
    expect(page).toContain('revenue.ie/en/jobs-and-pensions/emergency-tax/emergency-tax-rules.aspx');
    expect(page).toContain('190.77');
    expect(page).not.toMatch(/accountant|ACCA|accurate|precise|guaranteed|we recommend/i);
  });
  it('normal-basis estimate for €900 a week is about €113.85', () => {
    const normal = (44000 / 52) * 0.2 + (900 - 44000 / 52) * 0.4 - 4000 / 52;
    expect(normal.toFixed(2)).toBe('113.85');
  });
  it('is in the sitemap, related links and Guides menu', () => {
    expect(read('app/sitemap.ts')).toContain("'/emergency-tax-ireland': '2026-10-15'");
    expect(read('components/RelatedCalculators.tsx')).toContain("href: '/emergency-tax-ireland'");
    expect(read('components/NavBar.tsx')).toContain("href: '/emergency-tax-ireland'");
  });
});
