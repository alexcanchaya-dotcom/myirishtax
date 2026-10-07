import {
  CGT_NO_DATE_NOTE,
  CGT_RATE_BEFORE_7_OCT_2026,
  CGT_RATE_FROM_7_OCT_2026,
  cgtRateForDisposal,
} from '../../lib/taxEngine/cgtRate';
import { calculateCGT, type Investment } from '../../lib/taxEngine/investmentCGT';
import { computeFullTaxReturn } from '../../lib/taxEngine/fullReturn';
import type { NormalisedTransaction } from '../../lib/normalisers/types';

// Budget 2027 Tax Policy Changes, p.7 §4.1: CGT standard rate 33% -> 31% for disposals on or after 7 October 2026.

describe('cgtRateForDisposal', () => {
  it('is 33% before 7 Oct 2026 and 31% from 7 Oct 2026', () => {
    expect(CGT_RATE_BEFORE_7_OCT_2026).toBe(0.33);
    expect(CGT_RATE_FROM_7_OCT_2026).toBe(0.31);
    expect(cgtRateForDisposal('2025-12-31')).toBe(0.33);
    expect(cgtRateForDisposal('2026-10-06')).toBe(0.33);
    expect(cgtRateForDisposal('2026-10-07')).toBe(0.31);
    expect(cgtRateForDisposal('2027-03-01')).toBe(0.31);
  });

  it('uses the Irish calendar day for timestamps', () => {
    expect(cgtRateForDisposal('2026-10-06T22:59:00Z')).toBe(0.33); // 23:59 on 6 Oct in Dublin
    expect(cgtRateForDisposal('2026-10-06T23:30:00Z')).toBe(0.31); // 00:30 on 7 Oct in Dublin
    expect(cgtRateForDisposal('2026-10-07T00:30:00+01:00')).toBe(0.31);
  });

  it('defaults to 31% with no usable date', () => {
    expect(cgtRateForDisposal(undefined)).toBe(0.31);
    expect(cgtRateForDisposal('')).toBe(0.31);
    expect(cgtRateForDisposal('not a date')).toBe(0.31);
    expect(CGT_NO_DATE_NOTE).toBe('Gains on disposals before 7 October 2026 are taxed at 33%.');
  });
});

function sale(id: string, disposalDate: string, proceeds: number, cost: number): Investment {
  return {
    id,
    symbol: 'ETF',
    type: 'stock',
    quantity: 1,
    acquisitionDate: '2020-01-01',
    acquisitionPrice: cost,
    acquisitionCost: cost,
    disposalDate,
    disposalPrice: proceeds,
    disposalProceeds: proceeds,
  };
}

describe('calculateCGT (investment tool, has disposal dates)', () => {
  it('€10,000 gain sold 6 Oct 2026: (10,000 − 1,270) × 33% = €2,880.90', () => {
    const r = calculateCGT([sale('a', '2026-10-06', 20000, 10000)], 2026);
    expect(r.taxableGain).toBe(8730);
    expect(r.cgtDue).toBeCloseTo(2880.9, 2);
    expect(r.cgtRate).toBeCloseTo(0.33, 10);
  });

  it('€10,000 gain sold 7 Oct 2026: (10,000 − 1,270) × 31% = €2,706.30', () => {
    const r = calculateCGT([sale('a', '2026-10-07', 20000, 10000)], 2026);
    expect(r.cgtDue).toBeCloseTo(2706.3, 2);
    expect(r.cgtRate).toBeCloseTo(0.31, 10);
  });

  it('2025 disposals stay at 33%; 2027 disposals are 31%', () => {
    expect(calculateCGT([sale('a', '2025-06-01', 20000, 10000)], 2025).cgtDue).toBeCloseTo(2880.9, 2);
    expect(calculateCGT([sale('a', '2027-06-01', 20000, 10000)], 2027).cgtDue).toBeCloseTo(2706.3, 2);
  });

  it('mixed 2026: exemption comes off the 33% gains first', () => {
    // €5,000 gain on 1 Sep (33%) and €5,000 gain on 1 Nov (31%).
    // 33%: (5,000 − 1,270) × 0.33 = 1,230.90. 31%: 5,000 × 0.31 = 1,550. Total €2,780.90.
    const r = calculateCGT([sale('a', '2026-09-01', 15000, 10000), sale('b', '2026-11-01', 15000, 10000)], 2026);
    expect(r.taxableGain).toBe(8730);
    expect(r.cgtDue).toBeCloseTo(2780.9, 2);
    expect(r.cgtByRate).toEqual([
      { rate: 0.31, taxableGain: 5000, cgtDue: 1550 },
      { rate: 0.33, taxableGain: 3730, cgtDue: expect.closeTo(1230.9, 2) },
    ]);
  });

  it('losses also come off the 33% gains first', () => {
    // Gains: €4,000 on 1 Sep (33%), €6,000 on 1 Nov (31%). Loss €2,000 on 1 Dec. Previous losses €1,000.
    // Net 8,000 − 1,000 − 1,270 = 5,730 taxable: 5,730 at 31% = €1,776.30 (33% gains fully covered).
    const r = calculateCGT(
      [sale('a', '2026-09-01', 14000, 10000), sale('b', '2026-11-01', 16000, 10000), sale('c', '2026-12-01', 8000, 10000)],
      2026,
      1000,
    );
    expect(r.taxableGain).toBe(5730);
    expect(r.cgtDue).toBeCloseTo(1776.3, 2);
  });
});

function trade(date: string, amount: number, costBasis: number): NormalisedTransaction {
  return { id: `${date}-${amount}`, date, type: 'stock_trade', amount, costBasis };
}

const income = { income: 50000, period: 'annual' as const, maritalStatus: 'single' as const, taxYear: 2026 };

describe('computeFullTaxReturn (/api/tax/compute)', () => {
  it('gain dated before 7 Oct 2026 is taxed at 33%, no note', () => {
    const r = computeFullTaxReturn(income, [trade('2026-10-06', 20000, 10000)]);
    expect(r.cgt).toBeCloseTo(2880.9, 2);
    expect(r.cgtByRate).toEqual([{ rate: 0.33, taxableGain: 8730, cgtDue: expect.closeTo(2880.9, 2) }]);
    expect(r.cgtNote).toBeUndefined();
  });

  it('gain dated on or after 7 Oct 2026 is taxed at 31%, no note', () => {
    const r = computeFullTaxReturn(income, [trade('2026-10-07', 20000, 10000)]);
    expect(r.cgt).toBeCloseTo(2706.3, 2);
    expect(r.cgtNote).toBeUndefined();
  });

  it('gain with no date: 31% plus the 33% note', () => {
    const r = computeFullTaxReturn(income, [trade('', 20000, 10000)]);
    expect(r.cgt).toBeCloseTo(2706.3, 2);
    expect(r.cgtNote).toBe('Gains on disposals before 7 October 2026 are taxed at 33%.');
  });

  it('mixed dates and loss carry-forward', () => {
    const r = computeFullTaxReturn(income, [trade('2026-09-01', 15000, 10000), trade('2026-11-01', 15000, 10000)], {
      lossCarryForward: 1000,
    });
    // Taxable 10,000 − 1,270 − 1,000 = 7,730: 5,000 at 31% (1,550) + 2,730 at 33% (900.90) = €2,450.90.
    expect(r.cgt).toBeCloseTo(2450.9, 2);
  });
});
