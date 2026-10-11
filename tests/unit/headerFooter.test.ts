import fs from 'fs';
import path from 'path';

const root = path.join(__dirname, '..', '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('header, sticky bar, favicon, footer', () => {
  it('has a favicon (app/icon.svg)', () => {
    expect(read('app/icon.svg')).toContain('<svg');
  });
  it('no sign-in, sign-up or pay entry point in the header, footer or pages (code and routes kept)', () => {
    const nav = read('components/NavBar.tsx');
    expect(nav).not.toContain('UserNav');
    const layout = read('app/layout.tsx');
    expect(layout).not.toContain('FooterAccountLinks');
    const c = read('app/contractor-calculator/ContractorCalculatorClient.tsx');
    expect(c).not.toContain('/auth/login');
    expect(c).not.toContain('Save Calculation');
    expect(c).not.toContain('Export PDF');
    expect(read('app/exit-tax-ireland/page.tsx')).not.toContain('href="/portfolio"');
    // Account, DB and Stripe code stays in place, just unlinked.
    for (const f of ['components/auth/UserNav.tsx', 'components/auth/FooterAccountLinks.tsx', 'app/auth/login/page.tsx', 'app/auth/signup/page.tsx', 'components/paywall/PaywallModal.tsx']) {
      expect(fs.existsSync(path.join(root, f))).toBe(true);
    }
  });
  it('no public page or shared component links to /auth, /dashboard, /portfolio or Stripe checkout', () => {
    const skip = /^(app\/(auth|dashboard|portfolio|api)|components\/(auth|paywall)\/|components\/FloatingAIChat)/;
    const files: string[] = [];
    const walk = (d: string) => {
      for (const e of fs.readdirSync(path.join(root, d), { withFileTypes: true })) {
        const rel = path.posix.join(d, e.name);
        if (e.isDirectory()) walk(rel);
        else if (/\.tsx$/.test(e.name) && !skip.test(rel)) files.push(rel);
      }
    };
    walk('app');
    walk('components');
    for (const f of files) {
      expect([f, read(f)]).not.toEqual([f, expect.stringMatching(/href=["'{`]*\/(auth|dashboard|portfolio|pricing)|\/api\/stripe/)]);
    }
  });
  it('one sticky bar: the fixed disclaimer bar is gone', () => {
    expect(read('app/layout.tsx')).not.toContain('StickyDisclaimer');
    expect(fs.existsSync(path.join(root, 'components/StickyDisclaimer.tsx'))).toBe(false);
    expect(read('app/globals.css')).toContain('--site-footer-offset: 0rem;');
  });
  it("footer no longer says 'Registered company details on request' and says not advice", () => {
    const l = read('app/layout.tsx');
    expect(l).not.toContain('Registered company details on request');
    expect(l).toContain('Estimate only, not financial or tax advice.');
  });
});
