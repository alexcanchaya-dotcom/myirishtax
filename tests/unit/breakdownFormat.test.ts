import { readFileSync } from 'fs';
import { join } from 'path';
import { formatBandLabel, formatCents, formatRate } from '../../lib/bandLabel';
import { calculateNetIncome, sumBands } from '../../lib/taxEngine';

describe('breakdown tables in plain euro (UX H2)', () => {
  it('band labels', () => {
    expect(formatBandLabel('0-44000')).toBe('€0 – €44,000');
    expect(formatBandLabel('44000-∞')).toBe('Over €44,000');
    expect(formatBandLabel('you 0-12012')).toBe('You: €0 – €12,012');
    expect(formatBandLabel('spouse 28700-70044')).toBe('Spouse: €28,700 – €70,044');
    expect(formatBandLabel('exempt (income €13,000 or less)')).toBe('Exempt (income €13,000 or less)');
  });
  it('rates and amounts', () => {
    expect(formatRate(0.2)).toBe('20%');
    expect(formatRate(0.005)).toBe('0.5%');
    expect(formatCents(8800)).toBe('€8,800.00');
    expect(formatCents(1332.816)).toBe('€1,332.82');
  });
  it('€60,000 single 2026: income tax table totals €15,200 before credits, USC €1,332.82', () => {
    const r = calculateNetIncome({ income: 60000, period: 'annual', maritalStatus: 'single', taxYear: 2026 });
    expect(formatCents(sumBands(r.paye))).toBe('€15,200.00');
    expect(formatCents(sumBands(r.usc))).toBe('€1,332.82');
  });
  it('table has a total row and the income tax table is titled "before credits"', () => {
    expect(readFileSync(join(__dirname, '../../components/BreakdownTable.tsx'), 'utf8')).toContain('<tfoot>');
    expect(readFileSync(join(__dirname, '../../app/HomeClient.tsx'), 'utf8')).toContain('title="Income tax (before credits)"');
  });
});
