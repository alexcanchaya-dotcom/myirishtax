import fs from 'fs';
import path from 'path';
import { octoberPrsiExample } from '../../lib/payslipPrsi';

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');

// DSP PRSI Class A rates: 4.2% to 30 Sep 2026, 4.35% from 1 Oct 2026; nil at €352/week or less.
describe('/payslip-october-prsi', () => {
  it('€60,000: €48.46 → €50.19 a week, €7.50 more a month, €2,542.50 for 2026', () => {
    const e = octoberPrsiExample(60000);
    expect(e.before).toBe(0.042);
    expect(e.after).toBe(0.0435);
    expect(e.weeklyBefore).toBeCloseTo(48.46, 2);
    expect(e.weeklyAfter).toBeCloseTo(50.19, 2);
    expect(e.monthlyBefore).toBeCloseTo(210, 6);
    expect(e.monthlyAfter).toBeCloseTo(217.5, 6);
    expect(e.monthlyMore).toBeCloseTo(7.5, 6);
    expect(e.yearPrsi2026).toBeCloseTo(2542.5, 6);
  });
  it('no change at €352 a week or less', () => {
    const e = octoberPrsiExample(352 * 52);
    expect(e.weeklyBefore).toBe(0);
    expect(e.weeklyAfter).toBe(0);
  });
  it('page links to the calculator, cites DSP, says not advice; in the sitemap', () => {
    const src = read('app/payslip-october-prsi/page.tsx');
    expect(src).toContain('href="/"');
    expect(src).toContain('prsi-class-a-rates');
    expect(src).toContain('<TrustStrip kind="guide"');
    expect(read('public/sitemap.xml')).toContain('https://myirishtax.com/payslip-october-prsi');
    expect(read('components/RelatedCalculators.tsx')).toContain("href: '/payslip-october-prsi'");
  });
});
