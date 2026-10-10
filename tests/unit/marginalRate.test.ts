import fs from 'fs';
import path from 'path';
import {
  marginalOnRaise,
  MARGINAL_HEADLINE_INCOME
} from '../../lib/marginalRate';

const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');

// Single PAYE, 2026: 20% to €44,000 then 40%; USC 3% to €70,044 then 8%;
// PRSI 4.2% Jan–Sep and 4.35% from 1 Oct 2026 (averaged over the year: 4.2375%).
describe('marginal rate on a €1,000 rise (2026, single)', () => {
  it.each([
    [30000, 200, 30, 727.6],
    [50000, 400, 30, 527.6],
    [80000, 400, 80, 477.6],
    [120000, 400, 80, 477.6]
  ])('€%i: income tax %i, USC %i, keep about €%f', (income, it, usc, kept) => {
    const r = marginalOnRaise(income);
    expect(r.incomeTax).toBeCloseTo(it, 2);
    expect(r.usc).toBeCloseTo(usc, 2);
    expect(r.prsi).toBeCloseTo(42.375, 1);
    expect(r.kept).toBeCloseTo(kept, 0);
    expect(r.incomeTax + r.usc + r.prsi + r.kept).toBeCloseTo(1000, 6);
  });

  it('headline is €80,000 and rounds to €478', () => {
    expect(MARGINAL_HEADLINE_INCOME).toBe(80000);
    expect(Math.round(marginalOnRaise(80000).kept)).toBe(478);
  });

  it('page title, related box and sitemap', () => {
    const page = read('app/marginal-tax-rate-ireland/page.tsx');
    expect(page).toContain(
      'title: "Why a pay rise adds so little: Ireland\'s marginal tax rate | MyIrishTax"'
    );
    expect(page).toContain(
      'Why does a €1,000 pay rise only add about €${keptRounded}?'
    );
    expect(page).toContain('<TaxDisclaimer />');
    expect(page).toContain('href="/redundancy-calculator"');
    expect(read('components/RelatedCalculators.tsx')).toContain(
      "href: '/marginal-tax-rate-ireland'"
    );
    expect(read('public/sitemap.xml')).toContain(
      '<loc>https://myirishtax.com/marginal-tax-rate-ireland</loc>'
    );
  });
});
