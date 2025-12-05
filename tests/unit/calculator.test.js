import { describe, expect, it } from 'vitest';
import { buildExportSummary, calculatePRSI, calculatePAYE, calculateTaxResult, calculateUSC, USC_BANDS_2025 } from '../../src/assets/calculator.js';

describe('calculator core functions', () => {
  it('computes USC progressively', () => {
    const usc = calculateUSC(60000);
    expect(usc).toBeCloseTo(2500.82, 2);
  });

  it('supports custom USC bands for prior tax year', () => {
    const customBands = [
      { limit: 12012, rate: 0.005 },
      { limit: 22000, rate: 0.02 },
      { limit: 50000, rate: 0.045 },
      { limit: Infinity, rate: 0.08 }
    ];
    const usc = calculateUSC(45000, customBands);
    expect(usc).toBeGreaterThan(0);
    expect(usc).not.toEqual(calculateUSC(45000, USC_BANDS_2025));
  });

  it('calculates PAYE with lower and higher bands', () => {
    const paye = calculatePAYE({ income: 82000, cutoff: 42000, credits: 3500 });
    expect(paye).toBe(14600);
  });

  it('builds net calculation when USC/PRSI toggled', () => {
    const result = calculateTaxResult({ income: 42000, cutoff: 42000, credits: 3500, includeUSC: false, includePRSI: false });
    expect(result).toEqual({ paye: 5000, usc: 0, prsi: 0, totalDeductions: 5000, net: 37000 });
  });

  it('creates export summary snapshot-friendly shape', () => {
    const result = calculateTaxResult({ income: 52000, cutoff: 42000, credits: 3500 });
    const summary = buildExportSummary(result, 2025);
    expect(summary.breakdown.paye).toBeDefined();
    expect(summary).toMatchSnapshot();
  });
});
