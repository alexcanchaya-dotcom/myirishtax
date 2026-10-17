import fs from 'fs';
import path from 'path';

const src = fs.readFileSync(
  path.join(__dirname, '..', '..', 'app/auto-enrolment-calculator/AutoEnrolmentCalculatorClient.tsx'),
  'utf8'
);

// WCAG relative-luminance contrast, to document why the -700 shades were chosen.
const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

describe('auto-enrolment text contrast (UX review S6 / AE2)', () => {
  it('no low-contrast text colours remain', () => {
    expect(src).not.toMatch(/text-red-500|text-gray-400|text-green-600/);
    for (const line of src.split('\n').filter((l) => l.includes('text-emerald-600'))) {
      expect(line).toMatch(/className="h-5 w-5 /); // icons only (non-text 3:1 rule)
    }
  });
  it('replacement shades pass 4.5:1 on white and their tinted cards', () => {
    expect(ratio('#047857', '#ffffff')).toBeGreaterThanOrEqual(4.5); // emerald-700
    expect(ratio('#047857', '#ecfdf5')).toBeGreaterThanOrEqual(4.5); // on emerald-50
    expect(ratio('#15803d', '#f0fdf4')).toBeGreaterThanOrEqual(4.5); // green-700 on green-50
    expect(ratio('#b91c1c', '#ffffff')).toBeGreaterThanOrEqual(4.5); // red-700
    expect(ratio('#6b7280', '#ffffff')).toBeGreaterThanOrEqual(4.5); // gray-500
  });
});
