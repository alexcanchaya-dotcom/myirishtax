import { calculatePAYEForYear, calculatePAYE, calculatePRSI, calculateUSC, TAX_CONFIGS } from '../src/lib/tax/index.js';

describe('tax engine', () => {
  it('calculates PAYE with standard rate only for low income', () => {
    const config = TAX_CONFIGS[2025];
    const paye = calculatePAYE(20000, config.standardRateCutoff.single, config.defaultCredits.single, config.standardRate, config.higherRate);
    expect(paye).toBeCloseTo(0);
  });

  it('applies higher rate portion for high income', () => {
    const config = TAX_CONFIGS[2025];
    const paye = calculatePAYE(100000, config.standardRateCutoff.single, 0, config.standardRate, config.higherRate);
    const expected = config.standardRateCutoff.single * config.standardRate + (100000 - config.standardRateCutoff.single) * config.higherRate;
    expect(paye).toBeCloseTo(expected);
  });

  it('calculates USC bands progressively', () => {
    const usc = calculateUSC(60000, TAX_CONFIGS[2025].uscBands);
    expect(usc).toBeGreaterThan(0);
    expect(usc).toBeCloseTo(60000 * 0.08, -2);
  });

  it('calculates PRSI at flat rate', () => {
    const prsi = calculatePRSI(50000, TAX_CONFIGS[2025].prsiRate);
    expect(prsi).toBeCloseTo(2000);
  });

  it('returns non-negative amounts even for low or zero income', () => {
    const result = calculatePAYEForYear(2025, { income: 0, includeUSC: true, includePRSI: true });
    expect(result.net).toBe(0);
    expect(result.totalDeductions).toBe(0);
  });

  it('supports married two incomes with higher cutoff', () => {
    const result = calculatePAYEForYear(2025, {
      income: 42000,
      spouseIncome: 42000,
      maritalStatus: 'married_two_incomes'
    });
    expect(result.paye).toBeLessThan(calculatePAYEForYear(2025, { income: 84000, maritalStatus: 'single' }).paye);
  });
});
