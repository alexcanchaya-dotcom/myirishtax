import { BUDGET_2027 } from '../../lib/config/taxYear2027';
import { isSingleOnlyYear, isTaxYearAvailable, toTaxYearConfig } from '../../lib/config/taxYearConfig';
import { calculateNetIncome } from '../../lib/taxEngine';
import { buildBudgetTable } from '../../lib/budget/budgetTable';

// Appendix A of budget-2027-spec.md (2026, PRSI month-weighted), rounded to the euro.
const APPENDIX_A_2026 = {
  single: { 30000: 26296, 45000: 37010, 60000: 44925, 80000: 54979, 100000: 64532 },
  couple: { 30000: 28296, 45000: 39210, 60000: 48725, 80000: 58779, 100000: 68332 },
} as const;

describe('Budget 2027 table', () => {
  it('the 2026 column matches Appendix A', () => {
    const table = buildBudgetTable(2026, 2026);
    for (const row of table.single) {
      expect(Math.round(row.takeHomeBefore)).toBe(APPENDIX_A_2026.single[row.income as keyof typeof APPENDIX_A_2026.single]);
    }
    for (const row of table.couple) {
      expect(Math.round(row.takeHomeBefore)).toBe(APPENDIX_A_2026.couple[row.income as keyof typeof APPENDIX_A_2026.couple]);
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
    for (const row of table.singleParent) {
      const direct = calculateNetIncome({ income: row.income, period: 'annual', maritalStatus: 'single', singleParent: true, taxYear: 2027 });
      expect(row.takeHomeAfter).toBeCloseTo(direct.netAnnual, 6);
    }
    for (const row of table.couple) {
      const direct = calculateNetIncome({ income: row.income, period: 'annual', maritalStatus: 'married', taxYear: 2027 });
      expect(row.takeHomeAfter).toBeCloseTo(direct.netAnnual, 6);
    }
    for (const row of table.coupleTwoEarners) {
      const direct = calculateNetIncome({
        income: row.income,
        spouseIncome: row.spouseIncome,
        period: 'annual',
        maritalStatus: 'married',
        taxYear: 2027,
      });
      expect(row.takeHomeAfter).toBeCloseTo(direct.netAnnual, 6);
    }
  });

  it('2027 is on for everyone (Finance (No. 2) Bill 2026 s.3): married, civil partners, single parents and home carers work', () => {
    expect(BUDGET_2027.singleOnly).toBe(false);
    expect(isSingleOnlyYear(2027)).toBe(false);
    const base = { income: 50000, period: 'annual' as const, taxYear: 2027 };
    expect(() => calculateNetIncome({ ...base, maritalStatus: 'married' })).not.toThrow();
    expect(() => calculateNetIncome({ ...base, maritalStatus: 'married', spouseIncome: 30000 })).not.toThrow();
    expect(() => calculateNetIncome({ ...base, maritalStatus: 'single', singleParent: true })).not.toThrow();
    expect(() => calculateNetIncome({ ...base, maritalStatus: 'married', homeCarer: true })).not.toThrow();
    expect(() => calculateNetIncome({ ...base, maritalStatus: 'single' })).not.toThrow();
  });

  it('2027 married, one income, €60,000: band €55,500 (Bill s.3(a)(ii) Part 3), credits €4,250 + €2,125', () => {
    const r = calculateNetIncome({ income: 60000, period: 'annual', maritalStatus: 'married', taxYear: 2027 });
    expect(r.paye[0].amount).toBeCloseTo(55500 * 0.2, 6);
    expect(r.paye[1].amount).toBeCloseTo(4500 * 0.4, 6);
    expect(r.payeAfterCredits).toBeCloseTo(55500 * 0.2 + 4500 * 0.4 - 4250 - 2125, 6); // 6,525
    expect(r.uscTotal).toBeCloseTo(1316.82, 2);
    expect(r.prsi).toBeCloseTo(2632.5, 2); // 9 months at 4.35% + 3 at 4.5%
    expect(r.netAnnual).toBeCloseTo(49525.68, 2);
  });

  it('2027 married, both earning €50,000 + €40,000: band €55,500 + €37,500 (Bill s.3(a)(i)), two employee credits', () => {
    const r = calculateNetIncome({ income: 50000, spouseIncome: 40000, period: 'annual', maritalStatus: 'married', taxYear: 2027 });
    // 20% on €90,000 (the whole €55,500 + €34,500 of the €37,500 increase, capped by the lower income) less €4,250 + 2 × €2,125.
    expect(r.payeAfterCredits).toBeCloseTo(90000 * 0.2 - 4250 - 2125 * 2, 6); // 9,500
    expect(r.netAnnual).toBeCloseTo(74817.61, 2);
  });

  it('2027 single parent, €50,000: band €50,500 (Bill s.3(a)(ii) Part 2), SPCCC stays €1,900 (s.462B not amended)', () => {
    const r = calculateNetIncome({ income: 50000, period: 'annual', maritalStatus: 'single', singleParent: true, taxYear: 2027 });
    expect(r.paye).toHaveLength(1); // all €50,000 inside the €50,500 band
    expect(r.payeAfterCredits).toBeCloseTo(50000 * 0.2 - 2125 - 2125 - 1900, 6); // 3,850
    expect(r.uscTotal).toBeCloseTo(1016.82, 2);
    expect(r.netAnnual).toBeCloseTo(42939.43, 2);
    const over = calculateNetIncome({ income: 60000, period: 'annual', maritalStatus: 'single', singleParent: true, taxYear: 2027 });
    expect(over.paye[0].amount).toBeCloseTo(50500 * 0.2, 6);
    expect(over.paye[1].amount).toBeCloseTo(9500 * 0.4, 6);
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
