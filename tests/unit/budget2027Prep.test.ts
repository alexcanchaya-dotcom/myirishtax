import fs from 'fs';
import path from 'path';
import { compareYears, headlineWeekly } from '../../lib/budget/compareYears';
import { buildBudgetTable } from '../../lib/budget/budgetTable';
import { BUDGET_2027 } from '../../lib/config/taxYear2027';
import { RATES_LABEL } from '../../lib/config/siteRates';
import sitemap from '../../app/sitemap';

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');

describe('#39 Budget 2027 (confirmed)', () => {
  it('status is confirmed', () => {
    expect(BUDGET_2027.status).toBe('confirmed');
  });

  it('compareYears: weekly headline with month and year, IT/USC/PRSI lines for both years (mechanics on 2025 → 2026)', () => {
    const rentTable = { 2025: { single: 1000, couple: 2000 }, 2026: { single: 1150, couple: 2300 } };
    const c = compareYears({ income: 60000 }, 2025, 2026, rentTable);
    // 2025 → 2026 at €60k single: income tax same (11,200); USC 1,332.82 vs 1,358.88 (2025: 3% from €27,382); PRSI 2,542.50 vs 2,475
    expect(c.before.incomeTax).toBeCloseTo(11200, 2);
    expect(c.after.incomeTax).toBeCloseTo(11200, 2);
    expect(c.after.prsi).toBeCloseTo(2542.5, 2);
    expect(c.diff.week).toBeCloseTo(c.diff.year / 52, 10);
    expect(c.diff.month).toBeCloseTo(c.diff.year / 12, 10);
    const rent = compareYears({ income: 60000, rent: true }, 2025, 2026, rentTable);
    expect(rent.before.rentCredit).toBe(1000);
    expect(rent.after.rentCredit).toBe(1150);
    expect(rent.diff.year - c.diff.year).toBeCloseTo(150, 6);
    const couple = compareYears({ income: 50000, spouseIncome: 40000, household: 'married', rent: true }, 2025, 2026, rentTable);
    expect(couple.after.rentCredit).toBe(2300);
  });

  it('compareYears 2026 → 2027 for a married one-income couple and a single parent at €45,000', () => {
    const married = compareYears({ income: 45000, household: 'married' });
    expect(married.before.incomeTax).toBeCloseTo(3000, 6); // 9,000 − 4,000 − 2,000
    expect(married.after.incomeTax).toBeCloseTo(2625, 6); // 9,000 − 4,250 − 2,125
    expect(married.diff.year).toBeCloseTo(323.5, 2);
    const parent = compareYears({ income: 45000, household: 'singleParent' });
    expect(parent.before.incomeTax).toBeCloseTo(3100, 6); // 9,000 − 2,000 − 2,000 − 1,900
    expect(parent.after.incomeTax).toBeCloseTo(2850, 6); // 9,000 − 2,125 − 2,125 − 1,900
    expect(parent.diff.year).toBeCloseTo(198.5, 2);
    // spouseIncome is ignored unless married
    expect(compareYears({ income: 45000, household: 'single', spouseIncome: 30000 }).after.takeHome).toBeCloseTo(
      compareYears({ income: 45000 }).after.takeHome,
      6,
    );
  });

  it('headline wording', () => {
    expect(headlineWeekly(14.2)).toBe('€14.20 a week better off');
    expect(headlineWeekly(-3)).toBe('€3.00 a week worse off');
    expect(headlineWeekly(0.2)).toBe('about the same each week');
  });

  it('tables have week, month and year differences for singles, single parents, one-earner and two-earner couples', () => {
    const t = buildBudgetTable(2025, 2026);
    expect(Object.keys(t)).toEqual(['single', 'singleParent', 'couple', 'coupleTwoEarners']);
    expect(t.single[0].diffWeek).toBeCloseTo(t.single[0].diffYear / 52, 10);
    expect(t.coupleTwoEarners.map((r) => [r.income, r.spouseIncome])).toEqual([[30000, 30000], [50000, 40000], [70000, 15000], [60000, 60000]]);
    const page = read('app/budget-2027/page.tsx');
    expect(page).toContain('Difference a week');
    expect(page).toContain('<Table rows={table.singleParent} />');
    expect(page).toContain('<Table rows={table.couple} />');
    expect(page).toContain('<Table rows={table.coupleTwoEarners} />');
    expect(page).toContain('<Budget2027Compare />');
    const compare = read('components/budget/Budget2027Compare.tsx');
    expect(compare).toContain("{ label: 'Married or civil partners', value: 'married' }");
    expect(compare).toContain("{ label: 'A single parent', value: 'singleParent' }");
    expect(compare).toContain('Spouse or partner’s pay (per year)');
    // The old pending line is gone everywhere.
    for (const f of ['components/budget/Budget2027Compare.tsx', 'app/budget-2027/page.tsx', 'app/HomeClient.tsx', 'lib/config/taxYear2027.ts']) {
      expect(read(f)).not.toContain('COUPLES_PENDING_LINE');
      expect(read(f)).not.toContain('added once the Finance Bill confirms');
    }
    // The homepage keeps the married / single-parent options; they only hide if singleOnly is ever set back to true.
    expect(BUDGET_2027.singleOnly).toBe(false);
    const home = read('app/HomeClient.tsx');
    expect(home).toContain('{singleOnly ? SINGLE_ONLY_LINE : MARRIED_HINT}');
  });

  it('homepage link, homepage title, rates label, related box and sitemap entry are on', () => {
    expect(read('app/HomeClient.tsx')).toMatch(/BUDGET_2027\.status === 'confirmed' \? \(\s*<p>\s*<Link href="\/budget-2027"/);
    expect(read('app/layout.tsx')).toContain("'Irish take-home pay 2027 and 2026 | Budget 2027 calculator | MyIrishTax'");
    expect(RATES_LABEL).toBe('Budget 2027 rates');
    expect(read('lib/config/siteRates.ts')).toContain("'Budget 2027 rates'");
    expect(sitemap().some((e) => e.url.endsWith('/budget-2027'))).toBe(true);
    expect(read('components/RelatedCalculators.tsx')).toContain("href: '/budget-2027'");
    expect(read('app/sitemap.ts')).toContain('lastModified: BUDGET_2027.figuresCheckedOnIso');
  });
});
