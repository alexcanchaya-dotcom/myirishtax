import { readFileSync } from 'fs';
import { join } from 'path';

const src = readFileSync(join(__dirname, '../../app/rent-tax-credit/RentTaxCreditClient.tsx'), 'utf8');

describe('rent tax credit page: small UX fixes (RT1, RT2, RT4)', () => {
  it('defaults to 2026 like the other calculators (Revenue: PAYE workers can claim 2026 in-year) with "2026 tax year" labels', () => {
    expect(src).toContain('useState<number>(2026)');
    expect(src).toContain('label: `${y} tax year`');
  });
  it('year grid fits a phone: 3 columns, 5 from sm', () => {
    expect(src).toContain('grid grid-cols-3 gap-2 mb-4 sm:grid-cols-5');
    expect(src).toContain('rounded-lg p-2 text-center border sm:p-3');
  });
  it('contrast: total bar white on orange-700 (5.18:1), year label gray-700', () => {
    expect(src).toContain('bg-orange-700 text-white');
    expect(src).not.toContain('bg-orange-500 text-white');
    expect(src).toContain('text-xs font-semibold text-gray-700 mb-1">{year}');
  });
});
