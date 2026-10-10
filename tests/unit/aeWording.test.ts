import { readFileSync } from 'fs';
import { join } from 'path';

const src = readFileSync(join(__dirname, '../../app/auto-enrolment-calculator/AutoEnrolmentCalculatorClient.tsx'), 'utf8');

describe("auto-enrolment: no 'Good news:' before bad news (UX AE1)", () => {
  it('says plainly there is no tax relief on your share, then what is added', () => {
    expect(src).not.toContain('Good news:');
    expect(src).toContain('<strong>No tax relief on your share:</strong> unlike a private pension, your contributions get');
    expect(src).toContain('Your employer and the State still add');
    expect(src).toContain('a year on top.');
  });
});
