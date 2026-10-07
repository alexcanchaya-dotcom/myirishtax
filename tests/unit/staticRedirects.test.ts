import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Every old static .html page in /public must either redirect (308, next.config.mjs) or be on the keep list.
const KEEP = new Set(['/refunds.html']); // only refund policy on the site; business/legal call, not a tax page

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
  it.each(htmlFiles(join(__dirname, '../../public')))('%s redirects permanently or is kept on purpose', (page) => {
    expect(sources.has(page) || KEEP.has(page)).toBe(true);
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
