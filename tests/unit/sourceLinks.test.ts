import fs from 'fs';
import path from 'path';

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');

describe('source lists link the label, not a raw URL (phone wrapping)', () => {
  it.each([
    'components/rent/HowToClaimSection.tsx',
    'components/redundancy/TaxFreeSection.tsx',
    'app/small-benefit-exemption/page.tsx',
    'app/second-income-form-12/page.tsx',
    'components/auto-enrolment/OptOutSection.tsx',
  ])('%s', (file) => {
    const src = read(file);
    expect(src).not.toContain('break-all');
    expect(src).not.toMatch(/>\s*\{s\.href\}\s*</);
    expect(src).toMatch(/target="_blank">\s*\{s\.label\}\s*<\/a>/);
    expect(src).toContain("new URL(s.href).hostname.replace(/^www\\./, '')");
  });
});
