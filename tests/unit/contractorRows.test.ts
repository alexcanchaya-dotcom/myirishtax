import fs from 'fs';
import path from 'path';
import { calculateContractorTax } from '../../lib/taxEngine/contractorCalculator';
import { buildContractorRows } from '../../lib/contractorRows';

type In = Parameters<typeof calculateContractorTax>[0];
const base = { grossIncome: 80000, expenses: 15000, taxYear: 2026, maritalStatus: 'single' } as unknown as In;

const CASES: [string, In][] = [
  ['page defaults €80k − €15k', base],
  ['€60k profit', { ...base, grossIncome: 60000, expenses: 0 } as In],
  ['€60k with €6k pension', { ...base, grossIncome: 60000, expenses: 0, pensionContribution: 6000 } as In],
  ['€150k (USC surcharge)', { ...base, grossIncome: 150000, expenses: 1234.56 } as In],
  ['€4,000 (no Class S)', { ...base, grossIncome: 4000, expenses: 0 } as In],
];

describe('contractor result rows (UX 3)', () => {
  it.each(CASES)('%s: whole euros that add up', (_n, input) => {
    const r = calculateContractorTax(input);
    const rows = buildContractorRows(r);
    for (const v of Object.values(rows)) expect(Number.isInteger(v)).toBe(true);
    expect(rows.gross - rows.expenses).toBe(rows.profit);
    expect(rows.incomeTaxBeforeCredits - rows.creditsUsed).toBe(rows.incomeTax);
    expect(rows.incomeTax + rows.usc + rows.prsi).toBe(rows.totalDeductions);
    expect(rows.profit - rows.totalDeductions - rows.pension).toBe(rows.takeHome);
    expect(Math.abs(rows.takeHome - r.netIncome)).toBeLessThanOrEqual(1);
  });

  it('page defaults: PRSI €2,754 (not €2,754.375), total €17,437, income tax 17,200 − 4,000 = 13,200', () => {
    const rows = buildContractorRows(calculateContractorTax(base));
    expect(rows).toMatchObject({ gross: 80000, expenses: 15000, profit: 65000, incomeTaxBeforeCredits: 17200, creditsUsed: 4000, incomeTax: 13200, totalDeductions: 17437 });
    expect([2754, 2755]).toContain(rows.prsi);
  });

  it('page uses en-IE whole euros, green-700 minus figures, no double-counted credits line', () => {
    const src = fs.readFileSync(path.join(__dirname, '../../app/contractor-calculator/ContractorCalculatorClient.tsx'), 'utf8');
    expect(src).toContain('toLocaleString("en-IE")');
    expect(src).not.toMatch(/toLocaleString\(\)|toLocaleString\(undefined/);
    expect(src).not.toContain('text-green-600');
    expect(src).toContain('text-green-700');
    expect(src).not.toContain('Income tax after credits');
  });
});
