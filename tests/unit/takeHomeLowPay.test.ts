import { calculateClassAPRSI, calculateNetIncome, calculateUSC, sumBands } from '../../lib/taxEngine';
import { calculateContractorTax } from '../../lib/taxEngine/contractorCalculator';
import { getTaxYearConfig, TaxYearConfig } from '../../lib/config/taxYearConfig';

// A year book with one flat Class A rate, to reproduce the DSP / Citizens Information weekly worked examples.
function flatRate(year: number, rate: number): TaxYearConfig {
  return { ...getTaxYearConfig(year), prsiRate: rate, prsiRateChanges: [] };
}
const weeklyPrsi = (weekly: number, config: TaxYearConfig) => calculateClassAPRSI(weekly * 52, config) / 52;

describe('USC exemption: no USC at €13,000 or less, full income above (s.531AM(2) TCA; Revenue USC manual 18D-00-01)', () => {
  it.each([2023, 2024, 2025, 2026])('%i threshold is €13,000', (year) => {
    expect(getTaxYearConfig(year).uscExemptionThreshold).toBe(13000);
  });

  it('Revenue 2026 example: €12,500 pays no USC', () => {
    expect(sumBands(calculateUSC(12500, getTaxYearConfig(2026)))).toBe(0);
  });

  it('€13,000 exactly pays no USC ("does not exceed €13,000")', () => {
    expect(sumBands(calculateUSC(13000, getTaxYearConfig(2026)))).toBe(0);
  });

  it('Revenue 2026 example: €13,500 pays USC on the full €13,500', () => {
    // 0.5% × 12,012 + 2% × 1,488 = 60.06 + 29.76
    expect(sumBands(calculateUSC(13500, getTaxYearConfig(2026)))).toBeCloseTo(89.82, 2);
  });
});

describe('Class A employee PRSI: €352 weekly nil band and €12 tapered credit (DSP Class A rates)', () => {
  it('€352 a week or less pays no PRSI', () => {
    expect(weeklyPrsi(352, getTaxYearConfig(2026))).toBe(0);
    expect(weeklyPrsi(200, getTaxYearConfig(2026))).toBe(0);
  });

  it('Citizens Information: €352.01 a week at 4.2% → €14.78 − €12 = €2.78', () => {
    expect(weeklyPrsi(352.01, flatRate(2026, 0.042))).toBeCloseTo(2.78, 2);
  });

  it('Citizens Information: €377 a week at 4.2% → €15.83 − €7.83 = €8.00', () => {
    expect(weeklyPrsi(377, flatRate(2026, 0.042))).toBeCloseTo(8.0, 2);
  });

  it('DSP 2025 advance notice: €377 a week at 4.1% → €15.46 − €7.83 = €7.63 (DSP rounds each step to the cent)', () => {
    expect(weeklyPrsi(377, flatRate(2025, 0.041))).toBeCloseTo(7.63, 1);
  });

  it('above €424 a week there is no credit: the rate on all earnings', () => {
    expect(weeklyPrsi(500, flatRate(2026, 0.042))).toBeCloseTo(21, 6);
  });
});

describe('Take-home 2026, single (live check figures)', () => {
  it('€12,000: no income tax, no USC, no PRSI → €12,000', () => {
    const r = calculateNetIncome({ income: 12000, period: 'annual', maritalStatus: 'single', taxYear: 2026 });
    expect(r.uscTotal).toBe(0);
    expect(r.prsi).toBe(0);
    expect(r.netAnnual).toBeCloseTo(12000, 2);
  });

  it('€20,000: USC €219.82, PRSI with the tapered credit ≈ €506', () => {
    const r = calculateNetIncome({ income: 20000, period: 'annual', maritalStatus: 'single', taxYear: 2026 });
    expect(r.payeAfterCredits).toBe(0);
    expect(r.uscTotal).toBeCloseTo(219.82, 2);
    expect(r.prsi).toBeCloseTo(506.07, 1);
    expect(r.netAnnual).toBeCloseTo(19274.1, 0);
  });

  it('€45,000: unchanged at €37,010.31', () => {
    const r = calculateNetIncome({ income: 45000, period: 'annual', maritalStatus: 'single', taxYear: 2026 });
    expect(r.netAnnual).toBeCloseTo(37010.31, 2);
  });
});

describe('2024 and 2025 rate changes on 1 October', () => {
  it('2025 take-home €45,000 uses 4.1% Jan–Sep and 4.2% from October (4.125%)', () => {
    const r = calculateNetIncome({ income: 45000, period: 'annual', maritalStatus: 'single', taxYear: 2025 });
    expect(r.prsi).toBeCloseTo(45000 * 0.04125, 6);
  });

  it('2024 take-home €45,000 uses 4% Jan–Sep and 4.1% from October (4.025%)', () => {
    const r = calculateNetIncome({ income: 45000, period: 'annual', maritalStatus: 'single', taxYear: 2024 });
    expect(r.prsi).toBeCloseTo(45000 * 0.04025, 6);
  });

  it('contractor Class S 2025 on €60,000 profit is 4.125% = €2,475', () => {
    const r = calculateContractorTax({ grossIncome: 60000, expenses: 0, taxYear: 2025, maritalStatus: 'single' });
    expect(r.prsi.amount).toBeCloseTo(2475, 2);
    expect(r.prsi.rate).toContain('4.125%');
  });

  it('contractor with €12,000 profit pays no USC (exemption applies to all income)', () => {
    const r = calculateContractorTax({ grossIncome: 12000, expenses: 0, taxYear: 2026, maritalStatus: 'single' });
    expect(r.usc.total).toBe(0);
  });
});
