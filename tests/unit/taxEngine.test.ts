import { calculateNetIncome, compareScenarios } from '../../lib/taxEngine';
import { calculateContractorTax } from '../../lib/taxEngine/contractorCalculator';
import {
  CURRENT_TAX_YEAR,
  formatTaxYearLabel,
  getDefaultTaxYear,
  getTaxYearConfig,
} from '../../lib/config/taxYearConfig';
import { WEALTH_MODELER_FIRE_URL } from '../../lib/config/sisterSites';

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

  it('matches published 2026 PAYE, USC and PRSI bands for a single employee', () => {
    const config = getTaxYearConfig(2026);
    expect(config.incomeTaxBandsSingle[0]).toEqual({ upTo: 44000, rate: 0.2 });
    expect(config.incomeTaxBandsMarried[0]).toEqual({ upTo: 53000, rate: 0.2 });
    expect(config.uscBands).toEqual([
      { upTo: 12012, rate: 0.005 },
      { upTo: 28700, rate: 0.02 },
      { upTo: 70044, rate: 0.03 },
      { upTo: null, rate: 0.08 },
    ]);
    expect(config.prsiRate).toBe(0.042);
    expect(config.credits).toEqual({ personal: 2000, paye: 2000 });
    expect(config.creditsMarried).toEqual({ personal: 4000, paye: 2000 });
    expect(getDefaultTaxYear()).toBe(CURRENT_TAX_YEAR);
    expect(CURRENT_TAX_YEAR).toBe(2026);
    expect(formatTaxYearLabel(2026)).toBe('2026 tax year');
    expect(WEALTH_MODELER_FIRE_URL).toBe(
      'https://wealthmodeler.com/fire-calculator?utm_source=myirishtax',
    );

    const result = calculateNetIncome({
      income: 50000,
      period: 'annual',
      maritalStatus: 'single',
      taxYear: 2026,
    });

    // PAYE: 20% of €44,000 + 40% of €6,000 − €4,000 credits
    expect(result.payeBeforeCredits).toBeCloseTo(11200, 2);
    expect(result.payeAfterCredits).toBeCloseTo(7200, 2);
    // USC 2026: 0.5% to €12,012, 2% to €28,700, 3% on the rest
    expect(result.uscTotal).toBeCloseTo(60.06 + 333.76 + 639, 2);
    expect(result.prsi).toBeCloseTo(2100, 2);
    expect(result.totalTax).toBeCloseTo(result.payeAfterCredits + result.uscTotal + result.prsi, 2);
    expect(result.netAnnual).toBeCloseTo(50000 - result.totalTax, 2);
  });

  it('shows 2026 USC is lower than 2025 at the same pay because the 2% ceiling rose', () => {
    const input = {
      income: 28000,
      period: 'annual' as const,
      maritalStatus: 'single' as const,
    };
    const y2025 = calculateNetIncome({ ...input, taxYear: 2025 });
    const y2026 = calculateNetIncome({ ...input, taxYear: 2026 });

    // PAYE and credits are unchanged between the two years
    expect(y2026.payeAfterCredits).toBeCloseTo(y2025.payeAfterCredits, 2);
    // €28,000 sits above the 2025 2% ceiling (€27,382) and below the 2026 ceiling (€28,700)
    expect(y2025.uscTotal).toBeCloseTo(60.06 + 307.4 + 18.54, 2);
    expect(y2026.uscTotal).toBeCloseTo(60.06 + 319.76, 2);
    expect(y2026.uscTotal).toBeLessThan(y2025.uscTotal);
    // PRSI is 4.2% in 2026 vs 4% in 2025
    expect(y2025.prsi).toBeCloseTo(1120, 2);
    expect(y2026.prsi).toBeCloseTo(1176, 2);
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

  it('treats Married as one income only — not the two-income €88,000 band (2025 and 2026)', () => {
    for (const taxYear of [2025, 2026]) {
      const married = calculateNetIncome({
        income: 80000,
        period: 'annual',
        maritalStatus: 'married',
        taxYear,
      });

      // One-income cutoff €53,000: 20% of 53,000 + 40% of 27,000 = 10,600 + 10,800
      expect(married.payeBeforeCredits).toBeCloseTo(21400, 2);
      expect(married.credits).toBe(6000);
      expect(married.payeAfterCredits).toBeCloseTo(15400, 2);

      // Two-income max band would tax all €80,000 at 20% = €16,000. We must not do that.
      expect(married.payeBeforeCredits).toBeGreaterThan(16000);
    }
  });

  it('does not invent a second salary when Married is selected', () => {
    const married = calculateNetIncome({
      income: 60000,
      period: 'annual',
      maritalStatus: 'married',
      taxYear: 2026,
    });

    // One salary of €60,000: 20% of €53,000 + 40% of €7,000 = €13,400 before credits
    expect(married.payeBeforeCredits).toBeCloseTo(13400, 2);
    expect(married.netAnnual).toBeLessThan(60000);
    expect(married.prsi).toBeCloseTo(60000 * 0.042, 2);
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
