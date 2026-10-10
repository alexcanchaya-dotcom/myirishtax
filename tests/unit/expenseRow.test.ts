import { readFileSync } from 'fs';
import { join } from 'path';

const src = readFileSync(join(__dirname, '../../app/contractor-calculator/ContractorCalculatorClient.tsx'), 'utf8');

describe('contractor expense rows: tap size and labels (UX C2)', () => {
  it('remove button is 44px with an aria-label; add button 44px tall', () => {
    expect(src).toContain('aria-label={`Remove expense: ${expense.category}`}');
    expect(src).toContain('flex h-11 w-11 shrink-0 items-center justify-center');
    expect(src).toContain('flex min-h-11 items-center gap-1 px-2');
  });
  it('select and amount have accessible names (visually hidden labels)', () => {
    expect(src).toContain('label="Expense type"');
    expect(src).toContain('label="Amount"');
    expect(src).not.toMatch(/label=""/);
    expect(readFileSync(join(__dirname, '../../components/SelectField.tsx'), 'utf8')).toContain('<span className="sr-only">{label}</span>');
    expect(readFileSync(join(__dirname, '../../components/CalculatorInput.tsx'), 'utf8')).toContain("className={hideLabel ? 'sr-only' : undefined}");
  });
  it('row stacks on phones: category full width, amount and ✕ below', () => {
    expect(src).toContain('flex flex-wrap items-end gap-2 sm:flex-nowrap');
    expect(src).toContain('basis-full sm:flex-1 sm:basis-auto');
  });
});
