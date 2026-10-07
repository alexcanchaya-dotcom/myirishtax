import { calculateContractorTax } from '../../lib/taxEngine/contractorCalculator';
import { calculatePRSI } from '../../lib/taxEngine';
import { getTaxYearConfig } from '../../lib/config/taxYearConfig';

// Class S (DSP "PRSI Class S rates", updated 20 Jan 2026; gov.ie PRSI page):
// "4.2% until 30 September 2026 (4.35% from 1 October 2026) of all your reckonable income, or an annual minimum
// charge of €650, whichever is greater." Self-assessed 2026 blend: 4.2375%.
// Citizens Information: total income = gross income less allowable expenses; under €5,000 you are exempt.

const run = (grossIncome: number, expenses = 0, taxYear = 2026, extra: Record<string, unknown> = {}) =>
  calculateContractorTax({ grossIncome, expenses, taxYear, maritalStatus: 'single', ...extra });

describe('contractor Class S PRSI', () => {
  it('uses the shared 2026 rate book with the 1 October change', () => {
    const config = getTaxYearConfig(2026);
    expect(config.prsiRate).toBe(0.042);
    expect(config.prsiRateChanges).toEqual([{ fromMonth: 10, rate: 0.0435 }]);
  });

  it.each([
    { gross: 30000, expenses: 0, profit: 30000 },
    { gross: 50000, expenses: 0, profit: 50000 },
    { gross: 80000, expenses: 15000, profit: 65000 },
    { gross: 100000, expenses: 0, profit: 100000 },
  ])('€$gross less €$expenses expenses: 4.2375% on all €$profit profit (no €5,000 deduction)', ({ gross, expenses, profit }) => {
    const result = run(gross, expenses);
    expect(result.prsi.amount).toBeCloseTo(profit * 0.042375, 2);
    expect(result.prsi.rate).toBe('4.2375% (Class S)');
  });

  it('€60,000 profit: €2,542.50 (was €2,330.63 with the €5,000 deduction)', () => {
    expect(run(60000).prsi.amount).toBeCloseTo(2542.5, 2);
  });

  it('pension contributions do not reduce Class S PRSI', () => {
    expect(run(60000, 0, 2026, { pensionContribution: 6000 }).prsi.amount).toBeCloseTo(2542.5, 2);
  });

  it('exactly €5,000 profit pays the €650 minimum; under €5,000 pays nothing', () => {
    expect(run(5000).prsi.amount).toBe(650);
    expect(run(6000).prsi.amount).toBe(650);
    expect(run(4999.99).prsi.amount).toBe(0);
    expect(run(9000, 4500).prsi.amount).toBe(0); // profit €4,500
  });

  it('the €650 minimum gives way to the percentage above about €15,340 profit', () => {
    expect(run(15000).prsi.amount).toBe(650); // 15,000 × 4.2375% = €635.63
    expect(run(16000).prsi.amount).toBeCloseTo(678, 2);
  });

  it('per-year minimum: €500 (2023), €537.50 blended (2024), €650 (2025)', () => {
    expect(run(6000, 0, 2023).prsi.amount).toBe(500);
    expect(run(6000, 0, 2024).prsi.amount).toBe(537.5);
    expect(run(6000, 0, 2025).prsi.amount).toBe(650);
  });

  it('2025 uses the 2025 rate book on all profit', () => {
    expect(run(50000, 0, 2025).prsi.amount).toBeCloseTo(calculatePRSI(50000, getTaxYearConfig(2025)), 2);
  });
});

describe('contractor income tax, USC and preliminary tax (2026, single)', () => {
  // Hand calc from Revenue 2026 rates: 20% to €44,000, then 40%; credits personal €2,000 + Earned Income €2,000.
  it('€60,000 profit: IT €11,200, USC €1,332.82, PRSI €2,542.50, take-home €44,924.68', () => {
    const r = run(60000);
    expect(r.incomeTax.total).toBeCloseTo(15200, 2);
    expect(r.credits).toEqual({ personalCredit: 2000, earnedIncomeCredit: 2000, total: 4000 });
    expect(r.incomeTax.afterCredits).toBeCloseTo(11200, 2);
    expect(r.usc.total).toBeCloseTo(1332.82, 2);
    expect(r.netIncome).toBeCloseTo(44924.68, 2);
  });

  it('USC is on profit, not gross: €70k income with €10k expenses = same as €60k profit', () => {
    const r = run(70000, 10000);
    expect(r.usc.total).toBeCloseTo(1332.82, 2);
    expect(r.netIncome).toBeCloseTo(44924.68, 2);
  });

  it('Earned Income Credit is capped at 20% of profit', () => {
    const r = run(8000);
    expect(r.credits.earnedIncomeCredit).toBeCloseTo(1600, 2);
    expect(r.incomeTax.afterCredits).toBe(0);
  });

  it('Earned Income Credit by year: €1,775 (2023), €1,875 (2024), €2,000 (2025)', () => {
    expect(run(60000, 0, 2023).credits.earnedIncomeCredit).toBe(1775);
    expect(run(60000, 0, 2024).credits.earnedIncomeCredit).toBe(1875);
    expect(run(60000, 0, 2025).credits.earnedIncomeCredit).toBe(2000);
  });

  it('3% USC surcharge on profit over €100,000: €150k → USC €9,530.62', () => {
    // Standard USC on €150k (Revenue Part 18D example rows): 60.06 + 333.76 + 1,240.32 + 6,396.48 = 8,030.62
    // Surcharge: (150,000 − 100,000) × 3% = 1,500
    const r = run(150000);
    expect(r.usc.total).toBeCloseTo(9530.62, 2);
    expect(r.netIncome).toBeCloseTo(86913.13, 2);
  });

  it('no surcharge at exactly €100,000 profit', () => {
    expect(run(100000).usc.total).toBeCloseTo(4030.62, 2);
  });

  it('pension relieves income tax only', () => {
    const r = run(60000, 0, 2026, { pensionContribution: 6000 });
    expect(r.incomeTax.afterCredits).toBeCloseTo(8800, 2); // 54,000: 8,800 + 4,000 − 4,000
    expect(r.usc.total).toBeCloseTo(1332.82, 2);
  });

  it('preliminary tax is 90% of income tax + USC + PRSI (or 100% of last year if lower)', () => {
    const r = run(60000, 0, 2026, { previousYearTax: 99999 });
    expect(r.preliminaryTax?.amount).toBeCloseTo(0.9 * (11200 + 1332.82 + 2542.5), 2); // €13,567.79
    expect(r.preliminaryTax?.method).toBe('current_year');
    const r2 = run(60000, 0, 2026, { previousYearTax: 12000 });
    expect(r2.preliminaryTax?.amount).toBe(12000);
    expect(r2.preliminaryTax?.method).toBe('previous_year');
  });
});
