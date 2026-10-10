import { readFileSync } from 'fs';
import { join } from 'path';
import { EXIT_TAX, deemedDisposalExample, exitTaxExampleRows, exitTaxOn } from '../../lib/exitTax';

const read = (p: string) => readFileSync(join(__dirname, '..', '..', p), 'utf8');
const page = read('app/exit-tax-ireland/page.tsx');

describe('/exit-tax-ireland', () => {
  it('rates: 38% now (Revenue eBrief 016/26), 35% announced with no start date (TPC 2.2, p.5)', () => {
    expect(EXIT_TAX.current.rate).toBe(0.38);
    expect(EXIT_TAX.current.from).toBe('1 January 2026');
    expect(EXIT_TAX.announced.rate).toBe(0.35);
    expect(EXIT_TAX.announced.startDate).toBeNull();
    expect(EXIT_TAX.deemedDisposalYears).toBe(8);
  });

  it('worked example: €10,000 gain is €3,800 at 38% and €3,500 at 35% (€300 less)', () => {
    expect(exitTaxOn(10000, 0.38)).toBeCloseTo(3800, 6);
    expect(exitTaxOn(10000, 0.35)).toBeCloseTo(3500, 6);
    const r = exitTaxExampleRows().find((x) => x.gain === 10000)!;
    expect(r.saving).toBeCloseTo(300, 6);
    expect(exitTaxOn(-500, 0.38)).toBe(0);
  });

  it('deemed disposal example: €20,000 → €30,000 at year 8 = €10,000 gain, €3,800 tax, new base €30,000', () => {
    expect(deemedDisposalExample(20000, 30000, 0.38)).toEqual({ gain: 10000, tax: 3800, newBase: 30000 });
  });

  it('uses the agreed wording, says deemed disposal is unchanged, and states no effective date', () => {
    expect(page).toContain('Budget 2027 announced a cut to {next}, due in 2027; the start date will be set in the Finance Bill.');
    expect(page).toContain('Deemed disposal (the 8-year rule) is unchanged.');
    expect(page).not.toMatch(/1 January 2027|from January 2027|1 Jan 2027|effective from/i);
    expect(page).toContain('&quot;being reduced from 38% to 35%&quot;');
  });

  it('trust strip and disclaimer, sources, and is linked from the CGT tool, nav, footer and sitemap', () => {
    expect(page).toContain('<TrustStrip');
    expect(page).toContain('kind="guide"');
    expect(page).toContain('https://www.revenue.ie/en/tax-professionals/ebrief/2026/no-0162026.aspx');
    expect(page).toContain('Budget_2027_-_Tax_Policy_Changes_-_Publication_Version.pdf');
    expect(read('app/portfolio/page.tsx')).toContain('href="/exit-tax-ireland"');
    expect(read('components/NavBar.tsx')).toContain("href: '/exit-tax-ireland'");
    expect(read('app/layout.tsx')).toContain('href="/exit-tax-ireland"');
    expect(read('app/sitemap.ts')).toContain("'/exit-tax-ireland'");
  });

  it('no words the team bans', () => {
    expect(page).not.toMatch(/accurate|precise|guaranteed|accountant|ACCA/i);
  });
});
