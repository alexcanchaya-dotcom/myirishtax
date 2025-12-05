import { calculateNetIncome, compareScenarios } from '../../lib/taxEngine';

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
});
