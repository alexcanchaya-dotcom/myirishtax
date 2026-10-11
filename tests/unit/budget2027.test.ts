import { BUDGET_2027 } from '../../lib/config/taxYear2027';
import { isTaxYearAvailable, toTaxYearConfig } from '../../lib/config/taxYearConfig';
import { calculateNetIncome } from '../../lib/taxEngine';
import { buildBudgetTable } from '../../lib/budget/budgetTable';

// Appendix A of budget-2027-spec.md (2026, PRSI month-weighted), rounded to the euro.
const APPENDIX_A_2026 = {
  single: { 30000: 26296, 45000: 37010, 60000: 44925, 80000: 54979, 100000: 64532 },
} as const;

describe('Budget 2027 table', () => {
  it('the 2026 column matches Appendix A', () => {
    const table = buildBudgetTable(2026, 2026);
    for (const row of table.single) {
      expect(Math.round(row.takeHomeBefore)).toBe(APPENDIX_A_2026.single[row.income as keyof typeof APPENDIX_A_2026.single]);
    }
  });

  it('toTaxYearConfig throws while blanks are empty, naming them', () => {
    const blank = JSON.parse(JSON.stringify(BUDGET_2027)) as typeof BUDGET_2027;
    blank.incomeTax.standardRate = null;
    blank.prsi.rateFrom1Jan = null;
    expect(() => toTaxYearConfig(blank)).toThrow(/2027_STANDARD_RATE/);
    expect(() => toTaxYearConfig(blank)).toThrow(/2027_PRSI_RATE_FROM_1_JAN/);
  });

  it('2027 is not available while the config is pending', () => {
    if (BUDGET_2027.status === 'pending') {
      expect(isTaxYearAvailable(2027)).toBe(false);
    }
    expect(isTaxYearAvailable(2026)).toBe(true);
  });

  it('once confirmed, the 2027 cells equal calculateNetIncome(taxYear: 2027)', () => {
    if (BUDGET_2027.status !== 'confirmed') return;
    const table = buildBudgetTable(2026, 2027);
    for (const row of table.single) {
      const direct = calculateNetIncome({ income: row.income, period: 'annual', maritalStatus: 'single', taxYear: 2027 });
      expect(row.takeHomeAfter).toBeCloseTo(direct.netAnnual, 6);
    }
  });

  it('2027 is single-only: married, civil partners, single parents and home carers are refused; 2026 still allows them', () => {
    const base = { income: 50000, period: 'annual' as const, taxYear: 2027 };
    expect(() => calculateNetIncome({ ...base, maritalStatus: 'married' })).toThrow(/single people only/);
    expect(() => calculateNetIncome({ ...base, maritalStatus: 'married', spouseIncome: 30000 })).toThrow(/single people only/);
    expect(() => calculateNetIncome({ ...base, maritalStatus: 'single', singleParent: true })).toThrow(/single people only/);
    expect(() => calculateNetIncome({ ...base, maritalStatus: 'married', homeCarer: true })).toThrow(/single people only/);
    expect(() => calculateNetIncome({ ...base, maritalStatus: 'single' })).not.toThrow();
    expect(() => calculateNetIncome({ ...base, taxYear: 2026, maritalStatus: 'married', spouseIncome: 30000 })).not.toThrow();
    expect(() => calculateNetIncome({ ...base, taxYear: 2026, maritalStatus: 'single', singleParent: true })).not.toThrow();
  });

  it('the one-parent band (€50,500) does not leak into single 2027: 20% band is €46,500', () => {
    const r = calculateNetIncome({ income: 50000, period: 'annual', maritalStatus: 'single', taxYear: 2027 });
    expect(r.paye[0].amount).toBeCloseTo(46500 * 0.2, 6); // 20% on €46,500, not €50,500
    expect(r.paye[1].amount).toBeCloseTo(3500 * 0.4, 6);
    expect(r.payeAfterCredits).toBeCloseTo(46500 * 0.2 + 3500 * 0.4 - 4250, 6);
  });

  it('2026 single €50k is unchanged (39,648.43)', () => {
    const r = calculateNetIncome({ income: 50000, period: 'annual', maritalStatus: 'single', taxYear: 2026 });
    expect(r.netAnnual).toBeCloseTo(39648.43, 2);
  });
});
