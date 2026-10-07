import { readFileSync } from 'fs';
import { join } from 'path';
import { calculateRedundancy } from '../../lib/redundancy2025';

// Citizens Information, Budget 2014: "Top Slicing Relief … will no longer be available from 1 January 2014 in
// respect of all ex-gratia lump sum payments." Revenue eBrief 28/2014: "the abolition Top Slicing Relief with
// effect from 1 January 2014". So the taxable lump sum is taxed at the person's own rates with no reduction.

describe('top slicing relief', () => {
  it('is not applied: €12,733.33 taxable at 40% + 3% USC = €5,475.33 (no reduction)', () => {
    const r = calculateRedundancy({ annualSalary: 52000, yearsService: 10, packageAmount: 60000 });
    expect(r.totalTax).toBeCloseTo(5475.33, 2);
    expect(r).not.toHaveProperty('enhancedTopSliceRelief');
  });

  it('the page does not promise lower tax from it', () => {
    const page = readFileSync(join(__dirname, '../../app/redundancy-calculator/RedundancyCalculatorClient.tsx'), 'utf8');
    expect(page).not.toMatch(/Top slicing relief can lower/);
    expect(page).toMatch(/abolished for ex-gratia payments made on or after\s+1 January 2014/);
  });
});
