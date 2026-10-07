import type { MetadataRoute } from 'next';
import { BUDGET_2027 } from '@/lib/config/taxYear2027';

const BASE = 'https://myirishtax.com';

/** Same pages as the old public/sitemap.xml. Keep in step with new pages. */
export const SITEMAP_PATHS = [
  '/',
  '/about',
  '/privacy',
  '/terms',
  '/cookies',
  '/disclaimer',
  '/contractor-calculator',
  '/redundancy-calculator',
  '/auto-enrolment-calculator',
  '/rent-tax-credit',
  '/small-benefit-exemption',
  '/second-income-form-12',
];

// /budget-2027 is listed (with a lastmod date) only once Budget 2027 is confirmed (#39 sign-off).
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = SITEMAP_PATHS.map((p) => ({ url: `${BASE}${p}` }));
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
