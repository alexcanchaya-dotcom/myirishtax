import type { MetadataRoute } from 'next';
import { BUDGET_2027 } from '@/lib/config/taxYear2027';

const BASE = 'https://myirishtax.com';

/** Each page and the date its content last changed (sitemap lastmod). Keep in step with new pages. */
export const SITEMAP_LASTMOD: Record<string, string> = {
  '/': '2026-10-10',
  '/about': '2026-10-07',
  '/privacy': '2026-10-04',
  '/terms': '2026-09-29',
  '/cookies': '2026-09-29',
  '/disclaimer': '2026-10-07',
  '/contractor-calculator': '2026-10-10',
  '/redundancy-calculator': '2026-10-07',
  '/auto-enrolment-calculator': '2026-10-10',
  '/rent-tax-credit': '2026-10-10',
  '/rent-a-room-relief': '2026-10-10',
  '/small-benefit-exemption': '2026-10-07',
  '/second-income-form-12': '2026-10-10',
  '/payslip-october-prsi': '2026-10-07',
  '/exit-tax-ireland': '2026-10-07',
};
export const SITEMAP_PATHS = Object.keys(SITEMAP_LASTMOD);

// /budget-2027 is listed (with a lastmod date) only once Budget 2027 is confirmed (#39 sign-off).
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = SITEMAP_PATHS.map((p) => ({ url: `${BASE}${p}`, lastModified: SITEMAP_LASTMOD[p] }));
  if (BUDGET_2027.status === 'confirmed') {
    entries.splice(1, 0, {
      url: `${BASE}/budget-2027`,
      ...(BUDGET_2027.figuresCheckedOnIso ? { lastModified: BUDGET_2027.figuresCheckedOnIso } : {}),
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  }
  return entries;
}
