import { POST as calcPost } from '../../app/api/calc/route';
import { POST as computePost } from '../../app/api/tax/compute/route';
import { computeFullTaxReturn, DIRT_RATE } from '../../lib/taxEngine/fullReturn';
import type { NormalisedTransaction } from '../../lib/normalisers/types';

const req = (body: unknown) =>
  new Request('http://localhost/api', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
const ok = { income: 45000, period: 'annual', maritalStatus: 'single', taxYear: 2026 };

describe('/api/calc validation', () => {
  it('accepts a normal request', async () => {
    const res = await calcPost(req(ok));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.breakdown.netAnnual).toBeCloseTo(37010.31, 2);
  });

  it('rejects negative income', async () => {
    expect((await calcPost(req({ ...ok, income: -100 }))).status).toBe(400);
  });

  it.each([2019, 2027, 2030, 2026.5])('rejects unsupported tax year %p (no silent fall-back to 2026)', async (taxYear) => {
    const res = await calcPost(req({ ...ok, taxYear }));
    expect(res.status).toBe(400);
  });

  it.each([2023, 2024, 2025, 2026])('accepts %i', async (taxYear) => {
    expect((await calcPost(req({ ...ok, taxYear }))).status).toBe(200);
  });

  it('rejects a negative pension contribution', async () => {
    expect((await calcPost(req({ ...ok, pensionContribution: -5 }))).status).toBe(400);
  });
});

describe('/api/tax/compute: DIRT 33%, dividends and ETFs not supported', () => {
  const income = { income: 50000, period: 'annual' as const, maritalStatus: 'single' as const, taxYear: 2026 };
  const tx = (type: NormalisedTransaction['type'], amount: number, costBasis?: number): NormalisedTransaction => ({
    id: `${type}-${amount}`,
    date: '2026-06-01',
    type,
    amount,
    costBasis,
  });

  it('deposit interest €1,000 → DIRT €330 (Revenue: 33%)', () => {
    expect(DIRT_RATE).toBe(0.33);
    expect(computeFullTaxReturn(income, [tx('interest', 1000)]).interestTax).toBeCloseTo(330, 6);
  });

  it('dividends are flagged as not supported and left out of the total', () => {
    const r = computeFullTaxReturn(income, [tx('dividend', 1000)]);
    expect(r.dividendTax).toBe(0);
    expect(r.unsupported).toEqual([expect.objectContaining({ type: 'dividend', count: 1 })]);
    expect(r.finalLiability).toBeCloseTo(r.paye.totalTax, 6);
  });

  it('ETF disposals are flagged and not taxed as CGT', () => {
    const r = computeFullTaxReturn(income, [tx('etf_trade', 20000, 10000)]);
    expect(r.cgt).toBe(0);
    expect(r.unsupported).toEqual([expect.objectContaining({ type: 'etf_trade', count: 1 })]);
  });

  it('no unsupported key when there is nothing unsupported', () => {
    expect(computeFullTaxReturn(income, [tx('interest', 100)]).unsupported).toBeUndefined();
  });

  it('route rejects negative income and unknown years', async () => {
    expect((await computePost(req({ ...income, income: -1, transactions: [] }))).status).toBe(400);
    expect((await computePost(req({ ...income, taxYear: 2027, transactions: [] }))).status).toBe(400);
  });
});
