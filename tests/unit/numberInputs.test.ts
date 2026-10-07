import fs from 'fs';
import path from 'path';
import { parseAmount } from '../../lib/parseAmount';

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');

describe('number boxes (UX 1)', () => {
  it.each([
    ['60000', 60000],
    ['60,000', 60000],
    ['€60,000', 60000],
    ['€ 60 000', 60000],
    [' 1,234.50 ', 1234.5],
    ['', 0],
    ['   ', 0],
    ['abc', 0],
    ['045000', 45000],
  ])('parseAmount(%j) = %d', (raw, expected) => {
    expect(parseAmount(raw)).toBe(expected);
  });

  it('CalculatorInput is a text box with a number keypad that can be left empty', () => {
    const src = read('components/CalculatorInput.tsx');
    expect(src).toContain('type="text"');
    expect(src).not.toContain('type="number"');
    expect(src).toContain('inputMode={inputMode}');
    expect(src).toContain("inputMode = 'decimal'");
    expect(src).toContain('autoComplete="off"');
    expect(src).toContain('enterKeyHint="done"');
    expect(src).toContain('value={raw}');
  });

  it('redundancy uses the shared CalculatorInput (no type=number boxes left)', () => {
    const src = read('app/redundancy-calculator/RedundancyCalculatorClient.tsx');
    expect(src).toContain('<CalculatorInput');
    expect(src).not.toContain('type="number"');
  });

  it('no calculator page still uses a bare type=number box', () => {
    for (const p of [
      'app/HomeClient.tsx',
      'app/contractor-calculator/ContractorCalculatorClient.tsx',
      'app/auto-enrolment-calculator/AutoEnrolmentCalculatorClient.tsx',
      'app/rent-tax-credit/RentTaxCreditClient.tsx',
    ]) {
      expect(read(p)).not.toContain('type="number"');
    }
  });
});
