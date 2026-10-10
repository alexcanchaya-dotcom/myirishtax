import type { Metadata } from 'next';

export const SITE_URL = 'https://myirishtax.com';
const OG_IMAGE = { url: '/og-image.png', width: 1200, height: 630, alt: 'MyIrishTax: Irish tax estimates' };

/**
 * Per-page metadata with its own share preview. Without this, every page inherited the homepage's
 * og:title, og:description and og:url from app/layout.tsx, so shared links all looked like the homepage.
 */
export function pageMeta({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  /** Keep a placeholder page out of search results (still followed). */
  noindex?: boolean;
}): Metadata {
  const url = path === '/' ? SITE_URL : `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url, siteName: 'MyIrishTax', type: 'website', images: [OG_IMAGE] },
    twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE.url] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
