import { calculateContractorTax } from '../../lib/taxEngine/contractorCalculator';

// Revenue Pensions Manual ch. 21 (RACs): relief limited to the age % of "the lower of the individual's
// net relevant earnings, and the earnings limit" (€115,000). Ch. 24 (PRSAs): Lindsay, aged 50,
// "€35,000 x 30% = €10,500". Pension relief is income tax only (no USC or PRSI relief).
const base = { expenses: 0, taxYear: 2026, maritalStatus: 'single' as const };

describe('contractor pension: age limits and €115,000 cap', () => {
  it('Revenue PRSA example: aged 50 on €35,000 → limit €10,500', () => {
    const r = calculateContractorTax({ ...base, grossIncome: 35000, pensionContribution: 12000, age: 50 });
    expect(r.pension).toMatchObject({ limit: 10500, relieved: 10500, overLimit: 1500, ageGiven: true });
  });

  it('within the limit: €60k profit, €6k pension → income tax on €54k, USC/PRSI on €60k, take-home after pension', () => {
    const r = calculateContractorTax({ ...base, grossIncome: 60000, pensionContribution: 6000, age: 45 });
    // 8,800 + 40% × 10,000 − 4,000 credits (personal + EITC) = 8,800
    expect(r.incomeTax.afterCredits).toBeCloseTo(8800, 2);
    expect(r.usc.total).toBeCloseTo(1332.82, 2);
    expect(r.prsi.amount).toBeCloseTo(2542.5, 2);
    expect(r.netIncome).toBeCloseTo(60000 - 6000 - 8800 - 1332.82 - 2542.5, 2); // 41,324.68
  });

  it('over the limit: age 25 on €60k, €12k pension → only €9,000 relieved', () => {
    const r = calculateContractorTax({ ...base, grossIncome: 60000, pensionContribution: 12000, age: 25 });
    expect(r.pension).toMatchObject({ limit: 9000, relieved: 9000, overLimit: 3000 });
    // Income tax on €51,000: 8,800 + 2,800 − 4,000 = 7,600
    expect(r.incomeTax.afterCredits).toBeCloseTo(7600, 2);
    expect(r.taxableIncome).toBe(51000);
  });

  it('profit above €115,000 counts as €115,000: age 60 → €46,000 limit', () => {
    const r = calculateContractorTax({ ...base, grossIncome: 200000, pensionContribution: 50000, age: 60 });
    expect(r.pension.limit).toBeCloseTo(46000, 6);
    expect(r.pension.overLimit).toBeCloseTo(4000, 6);
  });

  it('no pension: figures unchanged (€60k profit → €44,924.68)', () => {
    expect(calculateContractorTax({ ...base, grossIncome: 60000 }).netIncome).toBeCloseTo(44924.68, 2);
  });
});
