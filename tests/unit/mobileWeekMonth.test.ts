import fs from 'fs';
import path from 'path';
import { calculateNetIncome } from '../../lib/taxEngine';

describe('mobile result shows per week and per month next to per year', () => {
  const src = fs.readFileSync(path.join(__dirname, '../../app/HomeClient.tsx'), 'utf8');
  const start = src.lastIndexOf('<div', src.indexOf('data-testid="mobile-result"'));
  const card = src.slice(start, src.indexOf('</dl>', src.indexOf('data-testid="mobile-result"')));
  it('phone card has year, week and month', () => {
    expect(card).toContain('a year');
    expect(card).toContain('Per week');
    expect(card).toContain('formatEuro(result.netWeekly)');
    expect(card).toContain('Per month');
    expect(card).toContain('formatEuro(result.netMonthly)');
    expect(card).toContain('lg:hidden');
  });
  it('€60k single 2026: €864 a week, €3,744 a month', () => {
    const r = calculateNetIncome({ income: 60000, period: 'annual', maritalStatus: 'single', taxYear: 2026 });
    expect(Math.round(r.netWeekly)).toBe(864);
    expect(Math.round(r.netMonthly)).toBe(3744);
  });
});
