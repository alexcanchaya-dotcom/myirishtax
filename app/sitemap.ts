import type { MetadataRoute } from 'next';

const BASE = 'https://myirishtax.com';

const routes = [
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
  '/rental-calculator',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.6,
  }));
}
