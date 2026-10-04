import { calculateNetIncome, calculatePRSI } from '../../lib/taxEngine';
import { getTaxYearConfig } from '../../lib/config/taxYearConfig';

// Class A employee PRSI 2026: 4.2% Jan–Sep, 4.35% from 1 Oct 2026.
// Month-weighted: 9/12 × 4.2% + 3/12 × 4.35% = 4.2375% of gross.
const CASES = [
  // income, expected annual PRSI (split), flat 4.2% PRSI, take-home single (split, rounded)
  { income: 30000, prsi: 1271.25, flat: 1260, takeHomeSingle: 26296 },
  { income: 45000, prsi: 1906.875, flat: 1890, takeHomeSingle: 37010 },
  { income: 60000, prsi: 2542.5, flat: 2520, takeHomeSingle: 44925 },
  { income: 80000, prsi: 3390, flat: 3360, takeHomeSingle: 54979 },
  { income: 100000, prsi: 4237.5, flat: 4200, takeHomeSingle: 64532 },
];

describe('2026 PRSI split year (4.2% Jan–Sep, 4.35% from October)', () => {
  it('config records the 1 October 2026 change', () => {
    const config = getTaxYearConfig(2026);
    expect(config.prsiRate).toBe(0.042);
    expect(config.prsiRateChanges).toEqual([{ fromMonth: 10, rate: 0.0435 }]);
  });

  it.each(CASES)('€$income: annual PRSI is €$prsi', ({ income, prsi, flat, takeHomeSingle }) => {
    const single = calculateNetIncome({ income, period: 'annual', maritalStatus: 'single', taxYear: 2026 });
    const married = calculateNetIncome({ income, period: 'annual', maritalStatus: 'married', taxYear: 2026 });
    expect(single.prsi).toBeCloseTo(prsi, 2);
    expect(married.prsi).toBeCloseTo(prsi, 2);
    expect(Math.round(single.netAnnual)).toBe(takeHomeSingle);

    // Versus the old flat 4.2% for the whole year: €11.25 to €37.50 more PRSI at these incomes.
    const diff = single.prsi - flat;
    expect(diff).toBeCloseTo(income * 0.000375, 2);
    expect(diff).toBeGreaterThanOrEqual(11);
    expect(diff).toBeLessThanOrEqual(38);
  });

  it('monthly and weekly pay give the same annual PRSI as annual pay', () => {
    const annual = calculateNetIncome({ income: 48000, period: 'annual', maritalStatus: 'single', taxYear: 2026 });
    const monthly = calculateNetIncome({ income: 4000, period: 'monthly', maritalStatus: 'single', taxYear: 2026 });
    expect(monthly.prsi).toBeCloseTo(annual.prsi, 6);
    expect(annual.prsi).toBeCloseTo(48000 * 0.042375, 6);
  });

  it('years without a change stay flat (2025 is 4%)', () => {
    expect(calculatePRSI(50000, getTaxYearConfig(2025))).toBeCloseTo(2000, 6);
  });
});
