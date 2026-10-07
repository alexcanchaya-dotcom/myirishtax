import fs from 'fs';
import path from 'path';

const root = path.join(__dirname, '..', '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('header, sticky bar, favicon, footer', () => {
  it('has a favicon (app/icon.svg)', () => {
    expect(read('app/icon.svg')).toContain('<svg');
  });
  it('header shows no Sign in / Create account (only a signed-in account menu)', () => {
    const nav = read('components/NavBar.tsx');
    expect(nav).not.toMatch(/<UserNav \/>/);
    expect(nav.match(/<UserNav signedOutLinks=\{false\} \/>/g)?.length).toBe(2);
    expect(read('components/auth/UserNav.tsx')).toContain('if (!signedOutLinks && status !== "authenticated") return null;');
  });
  it('Sign in / Create account are small footer links', () => {
    expect(read('app/layout.tsx')).toContain('<FooterAccountLinks />');
    const f = read('components/auth/FooterAccountLinks.tsx');
    expect(f).toContain('href="/auth/login"');
    expect(f).toContain('href="/auth/signup"');
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
