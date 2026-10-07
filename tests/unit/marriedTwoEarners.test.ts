import { calculateNetIncome } from '../../lib/taxEngine';
import { POST } from '../../app/api/calc/route';

// Revenue "Joint assessment" worked example (2025): Mary €54,200 + John €36,200.
// Band €53,000 + increase €35,000 (lower of €35,000 or the lower income) = €88,000 at 20%.
// Income tax before credits €18,560.
// https://www.revenue.ie/en/life-events-and-personal-circumstances/marital-status/marriage-and-civil-partnerships/joint-assessment.aspx
describe('married / civil partners, two earners (joint assessment)', () => {
  it('matches the Revenue joint assessment example: €18,560 before credits', () => {
    const r = calculateNetIncome({ income: 54200, spouseIncome: 36200, period: 'annual', maritalStatus: 'married', taxYear: 2025 });
    expect(r.payeBeforeCredits).toBeCloseTo(18560, 2);
    expect(r.household?.standardRateBand).toBe(88000);
    // Revenue's John has investment income (one Employee Tax Credit, €6,000). Here both are PAYE: €4,000 + €2,000 + €2,000.
    expect(r.credits).toBe(8000);
    expect(r.payeAfterCredits).toBeCloseTo(10560, 2);
  });

  it('€50,000 + €40,000 in 2026: band €88,000, both Employee Tax Credits, USC and PRSI per person', () => {
    const r = calculateNetIncome({ income: 50000, spouseIncome: 40000, period: 'annual', maritalStatus: 'married', taxYear: 2026 });
    // 88,000 × 20% + 2,000 × 40% = 18,400; less 8,000 credits = 10,400
    expect(r.payeAfterCredits).toBeCloseTo(10400, 2);
    // USC: 50k 1,032.82; 40k 732.82
    expect(r.household?.yourUsc).toBeCloseTo(1032.82, 2);
    expect(r.household?.spouseUsc).toBeCloseTo(732.82, 2);
    // PRSI 2026: 9 months 4.2% + 3 months 4.35% = 4.2375%
    expect(r.household?.yourPrsi).toBeCloseTo(2118.75, 2);
    expect(r.household?.spousePrsi).toBeCloseTo(1695, 2);
    expect(r.netAnnual).toBeCloseTo(90000 - 10400 - 1765.64 - 3813.75, 2);
  });

  it('€70,000 + €15,000 in 2026: increase limited to the lower income (€15,000)', () => {
    const r = calculateNetIncome({ income: 70000, spouseIncome: 15000, period: 'annual', maritalStatus: 'married', taxYear: 2026 });
    expect(r.household?.bandIncrease).toBe(15000);
    // 68,000 × 20% + 17,000 × 40% = 20,400; less 8,000 = 12,400
    expect(r.payeAfterCredits).toBeCloseTo(12400, 2);
    // €15k: USC 60.06 + 2,988 × 2% = 119.82; PRSI nil (weekly €288.46 ≤ €352)
    expect(r.household?.spouseUsc).toBeCloseTo(119.82, 2);
    expect(r.household?.spousePrsi).toBe(0);
  });

  it('caps the Employee Tax Credit at 20% of a low second income', () => {
    const r = calculateNetIncome({ income: 60000, spouseIncome: 5000, period: 'annual', maritalStatus: 'married', taxYear: 2026 });
    expect(r.credits).toBe(4000 + 2000 + 1000);
  });

  it('is the higher earner too: the increase is the same whichever spouse is entered first', () => {
    const a = calculateNetIncome({ income: 70000, spouseIncome: 15000, period: 'annual', maritalStatus: 'married', taxYear: 2026 });
    const b = calculateNetIncome({ income: 15000, spouseIncome: 70000, period: 'annual', maritalStatus: 'married', taxYear: 2026 });
    expect(b.netAnnual).toBeCloseTo(a.netAnnual, 6);
  });

  it('leaves one-income married and single unchanged', () => {
    const one = calculateNetIncome({ income: 60000, period: 'annual', maritalStatus: 'married', taxYear: 2026 });
    const zero = calculateNetIncome({ income: 60000, spouseIncome: 0, period: 'annual', maritalStatus: 'married', taxYear: 2026 });
    expect(one.household).toBeUndefined();
    expect(zero.netAnnual).toBe(one.netAnnual);
    const single = calculateNetIncome({ income: 60000, spouseIncome: 40000, period: 'annual', maritalStatus: 'single', taxYear: 2026 });
    expect(single.household).toBeUndefined();
    expect(single.netAnnual).toBeCloseTo(44924.68, 2);
  });

  it('/api/calc accepts spouseIncome and rejects a negative one', async () => {
    const ok = await POST(new Request('http://x/api/calc', { method: 'POST', body: JSON.stringify({ income: 50000, spouseIncome: 40000, period: 'annual', maritalStatus: 'married', taxYear: 2026 }) }));
    expect(ok.status).toBe(200);
    expect((await ok.json()).breakdown.payeAfterCredits).toBeCloseTo(10400, 2);
    const bad = await POST(new Request('http://x/api/calc', { method: 'POST', body: JSON.stringify({ income: 50000, spouseIncome: -1, period: 'annual', maritalStatus: 'married', taxYear: 2026 }) }));
    expect(bad.status).toBe(400);
  });
});
