import { calculateContractorTax } from '../../lib/taxEngine/contractorCalculator';
import { getTaxYearConfig } from '../../lib/config/taxYearConfig';

// Class S 2026: same DSP rate change as Class A — 4.2% to 30 Sep, 4.35% from 1 Oct.
// Full-year blend 4.2375% of reckonable income (gross minus the existing €5,000 floor).
// Source: gov.ie PRSI Class S rates (updated 20 Jan 2026).

describe('contractor Class S PRSI 2026 split year', () => {
  it('uses the shared 2026 rate book with the 1 October change', () => {
    const config = getTaxYearConfig(2026);
    expect(config.prsiRate).toBe(0.042);
    expect(config.prsiRateChanges).toEqual([{ fromMonth: 10, rate: 0.0435 }]);
  });

  it.each([
    // gross, expenses → prsiable = gross - 5000 (expenses do not reduce Class S in this calculator)
    { gross: 30000, expenses: 0, prsiable: 25000, prsi: 25000 * 0.042375 },
    { gross: 50000, expenses: 0, prsiable: 45000, prsi: 45000 * 0.042375 },
    { gross: 80000, expenses: 15000, prsiable: 75000, prsi: 75000 * 0.042375 },
    { gross: 100000, expenses: 0, prsiable: 95000, prsi: 95000 * 0.042375 },
  ])('€$gross (expenses €$expenses): Class S PRSI is the 4.2375% blend on €$prsiable', ({ gross, expenses, prsiable, prsi }) => {
    const result = calculateContractorTax({
      grossIncome: gross,
      expenses,
      taxYear: 2026,
      maritalStatus: 'single',
    });
    expect(gross - 5000).toBe(prsiable);
    expect(result.prsi.amount).toBeCloseTo(prsi, 2);
    // Versus the old flat 4.2% on the same base
    const flat = prsiable * 0.042;
    const diff = result.prsi.amount - flat;
    expect(diff).toBeCloseTo(prsiable * 0.000375, 2);
    expect(result.prsi.rate).toContain('4.2375%');
    expect(result.prsi.rate).toContain('Class S');
  });

  it('2025 Class S stays at a flat 4%', () => {
    const result = calculateContractorTax({
      grossIncome: 50000,
      expenses: 0,
      taxYear: 2025,
      maritalStatus: 'single',
    });
    expect(result.prsi.amount).toBeCloseTo(45000 * 0.04, 2);
    expect(result.prsi.rate).toBe('4.0% (Class S)');
  });

  it('income at or under the €5,000 floor has no Class S PRSI', () => {
    const result = calculateContractorTax({
      grossIncome: 5000,
      expenses: 0,
      taxYear: 2026,
      maritalStatus: 'single',
    });
    expect(result.prsi.amount).toBe(0);
  });
});
