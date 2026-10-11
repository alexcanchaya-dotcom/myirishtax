import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// The old static .html pages were removed from /public; each old URL keeps a 308 redirect in next.config.mjs.
// (Static files would otherwise be served before the redirect on Cloudflare Workers static assets.)
const OLD_PAGES = [
  '/methodology.html', '/guides/prsi.html', '/contractor-calculator-landing.html', '/index.html', '/guides/usc.html',
  '/about.html', '/data-sources.html', '/cookies.html', '/privacy.html', '/terms.html', '/disclaimer.html',
  '/rental-calculator-landing.html', '/guides/bik.html', '/guides/pension-tax-relief.html',
  '/guides/rental-expenses.html', '/styleguide.html', '/refunds.html',
];

function htmlFiles(dir: string, base = ''): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return htmlFiles(full, `${base}/${name}`);
    return name.endsWith('.html') ? [`${base}/${name}`] : [];
  });
}

const config = readFileSync(join(__dirname, '../../next.config.mjs'), 'utf8');
const sources = new Map<string, string>();
for (const m of config.matchAll(/source:\s*'([^']+)',\s*destination:\s*'([^']+)',\s*permanent:\s*true/g)) sources.set(m[1], m[2]);

describe('old static .html pages', () => {
  it('no static .html pages remain in /public', () => {
    expect(htmlFiles(join(__dirname, '../../public'))).toEqual([]);
  });

  it.each(OLD_PAGES)('%s still redirects permanently', (page) => {
    expect(sources.has(page)).toBe(true);
  });

  it('redirect targets are live app routes', () => {
    const appDir = join(__dirname, '../../app');
    for (const dest of new Set(sources.values())) {
      if (dest === '/') continue;
      expect(statSync(join(appDir, dest.slice(1), 'page.tsx')).isFile()).toBe(true);
    }
  });

  it('no .html page is in the sitemap', () => {
    expect(readFileSync(join(__dirname, '../../public/sitemap.xml'), 'utf8')).not.toMatch(/\.html/);
  });

  it('signup links to the live terms and privacy pages', () => {
    const signup = readFileSync(join(__dirname, '../../app/auth/signup/page.tsx'), 'utf8');
    expect(signup).not.toMatch(/href="\/(terms|privacy)\.html"/);
  });
});
