import { readFileSync } from 'fs';
import { join } from 'path';
import { RENT_A_ROOM_LIMIT, checkRentARoom } from '../../lib/rentARoom';

const read = (p: string) => readFileSync(join(__dirname, '..', '..', p), 'utf8');
const base = { year: 2026, rent: 0, extras: 0, inYourHome: true, tenantIsChildOrEmployer: false, shortTermGuests: false };

describe('Rent-a-Room Relief checker (Revenue worked examples)', () => {
  it('limit is €14,000 for 2024–2026; no 2027 figure on main (that stays on the Budget 2027 branch)', () => {
    expect(RENT_A_ROOM_LIMIT).toEqual({ 2024: 14000, 2025: 14000, 2026: 14000 });
    expect(() => checkRentARoom({ ...base, year: 2027 })).toThrow();
    expect(read('app/rent-a-room-relief/page.tsx')).not.toMatch(/16,000|16000/);
    expect(read('lib/rentARoom.ts')).not.toMatch(/16,000|16000/);
  });

  it('Revenue Example 1 (John, 2024): €13,000 rent is exempt; expenses ignored', () => {
    const r = checkRentARoom({ ...base, year: 2024, rent: 13000 });
    expect(r.status).toBe('exempt');
    expect(r.taxable).toBe(0);
    expect(r.headroom).toBe(1000);
  });

  it('Revenue Example 2 (Mary, 2024): €13,000 rent + €1,500 meals = €14,500, over the limit, all taxed', () => {
    const r = checkRentARoom({ ...base, year: 2024, rent: 13000, extras: 1500 });
    expect(r.gross).toBe(14500);
    expect(r.status).toBe('over-limit');
    expect(r.taxable).toBe(14500);
  });

  it('exactly €14,000 is exempt ("does not exceed")', () => {
    expect(checkRentARoom({ ...base, rent: 14000 }).status).toBe('exempt');
    expect(checkRentARoom({ ...base, rent: 14001 }).status).toBe('over-limit');
  });

  it('exclusions: not your home, child/employer, short-term guests', () => {
    expect(checkRentARoom({ ...base, rent: 5000, inYourHome: false }).status).toBe('not-eligible');
    expect(checkRentARoom({ ...base, rent: 5000, tenantIsChildOrEmployer: true }).reasons[0]).toMatch(/child/);
    expect(checkRentARoom({ ...base, rent: 5000, shortTermGuests: true }).reasons[0]).toMatch(/28 days/);
  });

  it('page: trust strip, Revenue quote, not-advice line, linked from nav, footer, sitemap and Form 12 guide', () => {
    const page = read('app/rent-a-room-relief/page.tsx');
    expect(page).toContain('<TrustStrip');
    expect(page).toContain('The annual exemption limit for Rent-a-Room Relief is €14,000.');
    expect(read('app/rent-a-room-relief/RentARoomClient.tsx')).toContain('Estimate only, not financial or tax advice.');
    expect(read('components/NavBar.tsx')).toContain("href: '/rent-a-room-relief'");
    expect(read('app/layout.tsx')).toContain('href="/rent-a-room-relief"');
    expect(read('public/sitemap.xml')).toContain('https://myirishtax.com/rent-a-room-relief');
    expect(read('app/second-income-form-12/page.tsx')).toContain('href="/rent-a-room-relief"');
    expect(page + read('app/rent-a-room-relief/RentARoomClient.tsx')).not.toMatch(/accurate|precise|guaranteed|accountant|ACCA/i);
  });
});
