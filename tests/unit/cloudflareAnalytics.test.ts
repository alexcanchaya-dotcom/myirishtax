import fs from 'fs';
import path from 'path';

const root = path.join(__dirname, '..', '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('analytics: Cloudflare Web Analytics instead of Vercel Analytics', () => {
  it('layout renders the Cloudflare beacon, not @vercel/analytics', () => {
    const l = read('app/layout.tsx');
    expect(l).not.toContain('@vercel/analytics');
    expect(l).toContain('<CloudflareAnalytics />');
    expect(JSON.parse(read('package.json')).dependencies['@vercel/analytics']).toBeUndefined();
  });
  it('beacon uses the env token and renders nothing without it', () => {
    const c = read('components/CloudflareAnalytics.tsx');
    expect(c).toContain('process.env.NEXT_PUBLIC_CF_BEACON_TOKEN');
    expect(c).toContain('if (!token) return null;');
    expect(c).toContain('https://static.cloudflareinsights.com/beacon.min.js');
  });
  it('privacy page names Cloudflare Web Analytics, not Vercel', () => {
    const p = read('app/privacy/page.tsx');
    expect(p).toContain('We use Cloudflare Web Analytics to count page views.');
    expect(p).not.toContain('Vercel');
  });
});
