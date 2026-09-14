import { calculateNetIncome, compareScenarios } from '../../lib/taxEngine';
import { calculateContractorTax } from '../../lib/taxEngine/contractorCalculator';

describe('tax engine', () => {
  it('calculates net income with credits applied', () => {
    const result = calculateNetIncome({
      income: 50000,
      period: 'annual',
      maritalStatus: 'single',
      taxYear: 2024,
      pensionContribution: 0,
      additionalCredits: 0,
    });
    expect(result.totalTax).toBeGreaterThan(0);
    expect(result.netAnnual).toBeLessThan(50000);
  });

  it('compares scenarios', () => {
    const comparison = compareScenarios(
      { income: 50000, period: 'annual', maritalStatus: 'single', taxYear: 2024 },
      { income: 60000, period: 'annual', maritalStatus: 'single', taxYear: 2024 }
    );
    expect(comparison.delta.netAnnual).toBeGreaterThan(0);
  });

  it('applies tax credits to income tax only, not USC or PRSI', () => {
    const result = calculateNetIncome({
      income: 15000,
      period: 'annual',
      maritalStatus: 'single',
      taxYear: 2025,
    });

    // PAYE 20% of €15,000 = €3,000; credits €4,000 so PAYE after credits is €0
    expect(result.payeBeforeCredits).toBeCloseTo(3000, 2);
    expect(result.credits).toBe(4000);
    expect(result.payeAfterCredits).toBe(0);

    // Unused credits must not wipe USC or PRSI
    expect(result.uscTotal).toBeGreaterThan(0);
    expect(result.prsi).toBeCloseTo(600, 2);
    expect(result.totalTax).toBeCloseTo(result.uscTotal + result.prsi, 2);
    expect(result.totalTax).toBeGreaterThan(0);
  });

  it('uses 2025/2026 rate book bands and credits', () => {
    const single2025 = calculateNetIncome({
      income: 50000,
      period: 'annual',
      maritalStatus: 'single',
      taxYear: 2025,
    });
    // 20% of €44,000 + 40% of €6,000 = €8,800 + €2,400 = €11,200
    expect(single2025.payeBeforeCredits).toBeCloseTo(11200, 2);
    expect(single2025.credits).toBe(4000);
    expect(single2025.payeAfterCredits).toBeCloseTo(7200, 2);
    expect(single2025.prsi).toBeCloseTo(2000, 2);

    const single2026 = calculateNetIncome({
      income: 50000,
      period: 'annual',
      maritalStatus: 'single',
      taxYear: 2026,
    });
    expect(single2026.payeBeforeCredits).toBeCloseTo(11200, 2);
    expect(single2026.credits).toBe(4000);
    expect(single2026.prsi).toBeCloseTo(2100, 2); // 4.2%
  });

  it('applies married bands and married credits', () => {
    const input = {
      income: 50000,
      period: 'annual' as const,
      taxYear: 2025,
    };
    const single = calculateNetIncome({ ...input, maritalStatus: 'single' });
    const married = calculateNetIncome({ ...input, maritalStatus: 'married' });

    // Married one-income band is €53,000 so all €50,000 is at 20%
    expect(married.payeBeforeCredits).toBeCloseTo(10000, 2);
    expect(single.payeBeforeCredits).toBeCloseTo(11200, 2);
    expect(married.credits).toBe(6000);
    expect(single.credits).toBe(4000);
    expect(married.payeAfterCredits).toBeLessThan(single.payeAfterCredits);
    expect(married.totalTax).toBeLessThan(single.totalTax);
    expect(married.netAnnual).toBeGreaterThan(single.netAnnual);
  });
});

describe('contractor calculator', () => {
  it('uses the shared rate book and does not crash', () => {
    const result = calculateContractorTax({
      grossIncome: 80000,
      expenses: 15000,
      taxYear: 2026,
      maritalStatus: 'single',
    });

    expect(result.taxableIncome).toBe(65000);
    expect(result.incomeTax.total).toBeGreaterThan(0);
    expect(result.usc.total).toBeGreaterThan(0);
    expect(result.credits.total).toBe(2000); // personal only, no PAYE credit
    expect(result.incomeTax.afterCredits).toBe(Math.max(0, result.incomeTax.total - 2000));
    expect(result.totalTaxAndPrsi).toBeCloseTo(
      result.incomeTax.afterCredits + result.usc.total + result.prsi.amount,
      2,
    );
  });

  it('applies married contractor credits and bands', () => {
    const single = calculateContractorTax({
      grossIncome: 80000,
      expenses: 0,
      taxYear: 2025,
      maritalStatus: 'single',
    });
    const married = calculateContractorTax({
      grossIncome: 80000,
      expenses: 0,
      taxYear: 2025,
      maritalStatus: 'married',
    });

    expect(married.credits.total).toBe(4000);
    expect(single.credits.total).toBe(2000);
    expect(married.incomeTax.total).toBeLessThan(single.incomeTax.total);
  });

  it('computes preliminary tax from income tax after credits', () => {
    const result = calculateContractorTax({
      grossIncome: 60000,
      expenses: 0,
      taxYear: 2025,
      maritalStatus: 'single',
      previousYearTax: 50000,
    });

    expect(result.preliminaryTax).toBeDefined();
    expect(result.preliminaryTax?.amount).toBeCloseTo(result.incomeTax.afterCredits * 0.9, 2);
  });
});
