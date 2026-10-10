import fs from 'fs';
import path from 'path';
import { fromSearch, toSearch, type HomeUrlState } from '../../lib/homeUrlState';

const D: HomeUrlState = { income: 60000, period: 'annual', maritalStatus: 'single', spouseIncome: 0, singleParent: false, homeCarer: false, over65: false, reducedUsc: false, pension: 0, pensionAge: '', credits: 0, taxYear: 2026 };

describe('estimate in the URL + copy link (UX 5)', () => {
  it('defaults give a clean "/" (no query)', () => {
    expect(toSearch(D, D)).toBe('');
  });

  it('round-trips a couple with pension, age, credits and 2025', () => {
    const s: HomeUrlState = { income: 4200, period: 'monthly', maritalStatus: 'married', spouseIncome: 40000, singleParent: false, homeCarer: false, over65: false, reducedUsc: false, pension: 3000, pensionAge: '45', credits: 500, taxYear: 2025 };
    const q = toSearch(s, D);
    expect(q).toBe('?income=4200&period=monthly&status=married&spouse=40000&pension=3000&age=45&credits=500&year=2025');
    expect(fromSearch(q, D)).toEqual(s);
  });

  it('ignores bad values and keeps defaults', () => {
    expect(fromSearch('?income=-5&period=daily&status=x&year=1999&age=7&credits=abc', D)).toEqual(D);
  });

  it('spouse pay only goes in the URL when married', () => {
    expect(toSearch({ ...D, spouseIncome: 40000 }, D)).toBe('');
  });

  it('homepage reads/writes the URL and shows the copy button', () => {
    const src = fs.readFileSync(path.join(__dirname, '../../app/HomeClient.tsx'), 'utf8');
    expect(src).toContain('fromSearch(window.location.search');
    expect(src).toContain('window.history.replaceState');
    expect(src).toContain('<CopyEstimateLink />');
    const btn = fs.readFileSync(path.join(__dirname, '../../components/CopyEstimateLink.tsx'), 'utf8');
    expect(btn).toContain('Copy link to this estimate');
    expect(btn).toContain('Link copied');
    expect(btn).toContain('2000');
  });
});
