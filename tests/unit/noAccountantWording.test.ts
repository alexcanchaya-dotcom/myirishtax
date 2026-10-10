import fs from 'fs';
import path from 'path';

// PM rule (7 Oct 2026): "No accountant wording anywhere." Al: nothing suggesting an accountant or ACCA member reviews the numbers.
const ROOTS = ['app', 'components', 'lib', 'public'];
function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return /\.(tsx?|jsx?|mdx?|html)$/.test(e.name) ? [p] : [];
  });
}
const files = ROOTS.flatMap((r) => walk(path.join(__dirname, '..', '..', r)));
const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');

describe('no accountant / ACCA wording', () => {
  it('scans a real file list', () => {
    expect(files.length).toBeGreaterThan(50);
  });
  it.each(files.map((f) => [path.relative(path.join(__dirname, '..', '..'), f)]))('%s', (rel) => {
    expect(read(rel)).not.toMatch(/accountant|\bACCA\b/i);
  });
  it('shared disclaimer says estimate only, not financial or tax advice', () => {
    const d = read('components/TaxDisclaimer.tsx');
    expect(d).toContain('Estimate only, not financial or tax advice. Check complex cases with Revenue.');
  });
});
