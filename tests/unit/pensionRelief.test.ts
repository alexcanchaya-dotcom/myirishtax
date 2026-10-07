import { calculateNetIncome, calculatePensionRelief, pensionAgeLimitPct } from '../../lib/taxEngine';

// Revenue, Tax relief on pension contributions: "There is no relief from Universal Social Charge (USC)
// or Pay Related Social Insurance (PRSI) for employee pension contributions."
// Revenue, Tax relief limits: age % of earnings (15% under 30 … 40% at 60+), earnings capped at €115,000.

describe('pension contributions relieve income tax only', () => {
  const base = { income: 60000, period: 'annual' as const, maritalStatus: 'single' as const, taxYear: 2026 };

  it('€60,000 with a €6,000 pension: USC and PRSI on the full €60,000, income tax on €54,000', () => {
    const r = calculateNetIncome({ ...base, pensionContribution: 6000 });
    // Income tax: 20% × 44,000 + 40% × 10,000 − 4,000 credits = 8,800
    expect(r.payeAfterCredits).toBeCloseTo(8800, 2);
    // USC and PRSI match no pension
    const none = calculateNetIncome(base);
    expect(r.uscTotal).toBeCloseTo(none.uscTotal, 6);
    expect(r.uscTotal).toBeCloseTo(1332.82, 2);
    expect(r.prsi).toBeCloseTo(2542.5, 2);
    // Take-home: 60,000 − 6,000 pension − 8,800 − 1,332.82 − 2,542.50
    expect(r.netAnnual).toBeCloseTo(41324.68, 2);
    expect(r.pension.relieved).toBe(6000);
    expect(r.pension.overLimit).toBe(0);
  });

  it('the €6,000 pension costs €3,600 of take-home (40% income tax relief)', () => {
    const r = calculateNetIncome({ ...base, pensionContribution: 6000 });
    const none = calculateNetIncome(base);
    expect(none.netAnnual - r.netAnnual).toBeCloseTo(3600, 2);
  });
});

describe('Revenue age-related limits and €115,000 earnings cap', () => {
  it.each([
    [25, 0.15],
    [30, 0.2],
    [39, 0.2],
    [40, 0.25],
    [50, 0.3],
    [55, 0.35],
    [60, 0.4],
    [70, 0.4],
  ])('age %i → %f', (age, pct) => {
    expect(pensionAgeLimitPct(age)).toBe(pct);
  });

  it('Revenue example: aged 42 on €40,000 can get relief on up to €10,000', () => {
    expect(calculatePensionRelief(40000, 12000, 42)).toMatchObject({ limit: 10000, relieved: 10000, overLimit: 2000 });
  });

  it('earnings above €115,000 count as €115,000 (age 60: 40% × 115,000 = €46,000)', () => {
    expect(calculatePensionRelief(200000, 50000, 60).limit).toBeCloseTo(46000, 6);
  });

  it('over the limit: only the limit reduces income tax; take-home still loses the full contribution', () => {
    // Age 25 on €60,000: limit 15% = €9,000; contribution €12,000 → €3,000 gets no relief
    const r = calculateNetIncome({ income: 60000, period: 'annual', maritalStatus: 'single', taxYear: 2026, pensionContribution: 12000, age: 25 });
    expect(r.pension).toMatchObject({ limit: 9000, relieved: 9000, overLimit: 3000, ageGiven: true });
    // Income tax on €51,000: 8,800 + 40% × 7,000 − 4,000 = 7,600
    expect(r.payeAfterCredits).toBeCloseTo(7600, 2);
    expect(r.netAnnual).toBeCloseTo(60000 - 12000 - 7600 - 1332.82 - 2542.5, 2);
  });

  it('no age given: the 40% maximum applies and ageGiven is false', () => {
    const r = calculatePensionRelief(60000, 30000);
    expect(r).toMatchObject({ limit: 24000, relieved: 24000, overLimit: 6000, ageGiven: false });
  });
});
