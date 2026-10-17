import fs from 'fs';
import path from 'path';

const src = fs.readFileSync(
  path.join(__dirname, '..', '..', 'app/redundancy-calculator/RedundancyCalculatorClient.tsx'),
  'utf8'
);

describe('redundancy calculator form (UX review R2, R3, R5)', () => {
  it('is a real form so the keyboard Go/Enter key calculates', () => {
    expect(src).toMatch(/<form\s+onSubmit=\{handleSubmit\}/);
    expect(src).toContain('<button type="submit" className="btn-primary');
    expect(src).toContain('e?.preventDefault();');
  });
  it('uses the shared button style, not its own blue', () => {
    expect(src).not.toContain('bg-blue-600');
    expect(src).toContain('min-h-[44px]');
  });
  it('asks for pay instead of showing a summary of €0.00 lines', () => {
    expect(src).toContain('if (!inputs.annualSalary && !inputs.weeklyPay)');
    expect(src).toContain('Enter your annual salary or weekly pay to see an estimate.');
  });
  it('scrolls the results into view', () => {
    expect(src).toContain('resultsRef.current?.scrollIntoView');
    expect(src).toContain('<div ref={resultsRef}');
  });
});
