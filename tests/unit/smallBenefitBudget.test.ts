import fs from 'fs';
import path from 'path';

describe('small benefit page after Budget 2027', () => {
  const src = fs.readFileSync(path.join(__dirname, '../../app/small-benefit-exemption/page.tsx'), 'utf8');
  it('no longer says Budget 2027 could change this', () => {
    expect(src).not.toContain('Budget 2027 could change this');
  });
  it('says what Budget 2027 did: limits unchanged, ERR reporting option from 1 Jan 2027, with source', () => {
    expect(src).toContain('Budget 2027 (6 October 2026) did not change these limits');
    expect(src).toContain('From 1 January 2027');
    expect(src).toContain('by the 14th of the following month');
    expect(src).toContain('Budget 2027 Tax Policy Changes, section 6.11');
  });
});
