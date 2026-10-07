import fs from 'fs';
import path from 'path';
import { calculateNetIncome, type CalculationInput } from '../../lib/taxEngine';
import { buildSummaryRows } from '../../lib/summaryRows';

const base: CalculationInput = { income: 60000, period: 'annual', maritalStatus: 'single', taxYear: 2026 };

const CASES: [string, CalculationInput][] = [
  ['€60k single (default)', base],
  ['€60k with €6k pension, age 35', { ...base, pensionContribution: 6000, age: 35 }],
  ['€60k with €20k pension (over limit)', { ...base, pensionContribution: 20000, age: 25 }],
  ['€12k (USC exempt, PRSI nil, credits > tax)', { ...base, income: 12000 }],
  ['€20k', { ...base, income: 20000 }],
  ['€3,333.33 a month', { ...base, income: 3333.33, period: 'monthly' }],
  ['€987.65 a week, 2025', { ...base, income: 987.65, period: 'weekly', taxYear: 2025 }],
  ['€150k', { ...base, income: 150000 }],
  ['couple €50k + €40k', { ...base, income: 50000, spouseIncome: 40000, maritalStatus: 'married' }],
  ['couple €70k + €15k with extra credits', { ...base, income: 70000, spouseIncome: 15000, maritalStatus: 'married', additionalCredits: 1000 }],
];

describe('take-home card rows add up (UX 2)', () => {
  it.each(CASES)('%s', (_name, input) => {
    const d = calculateNetIncome(input);
    const r = buildSummaryRows(d);
    for (const v of Object.values(r)) expect(Number.isInteger(v)).toBe(true);
    expect(r.incomeTaxBeforeCredits - r.creditsUsed).toBe(r.incomeTax);
    expect(r.incomeTax + r.usc + r.prsi).toBe(r.totalDeductions);
    expect(r.gross - r.totalDeductions - r.pension).toBe(r.takeHome);
    expect(r.creditsUsed).toBeGreaterThanOrEqual(0);
    // Each row within €1 of the exact figure.
    expect(Math.abs(r.takeHome - d.netAnnual)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.usc - d.uscTotal)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.prsi - d.prsi)).toBeLessThanOrEqual(1);
  });

  it('default €60k reads: gross 60,000; income tax 15,200 − 4,000 = 11,200; total 15,075; take-home 44,925', () => {
    const r = buildSummaryRows(calculateNetIncome(base));
    expect(r).toMatchObject({ gross: 60000, incomeTaxBeforeCredits: 15200, creditsUsed: 4000, incomeTax: 11200, totalDeductions: 15075, pension: 0, takeHome: 44925 });
  });

  it('card shows the rows in order, credits as a minus under income tax, pension above take-home', () => {
    const src = fs.readFileSync(path.join(__dirname, '../../components/TaxSummaryCard.tsx'), 'utf8');
    const order = ['Gross pay', 'Income tax before credits', 'Less tax credits', '"Income tax"', '"USC"', '"PRSI"', 'Total tax, USC and PRSI', 'Pension contribution', '"Take-home"'];
    let at = -1;
    for (const label of order) {
      const i = src.indexOf(label, at + 1);
      expect(i).toBeGreaterThan(at);
      at = i;
    }
    expect(src).not.toContain('Credits used (income tax only)');
  });
});
