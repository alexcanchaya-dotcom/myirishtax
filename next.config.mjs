/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permanent (308) redirects for stale static HTML that still quotes old PRSI/USC rates.
  // /about has the live "How the numbers are treated" methodology; / has the live Class A PRSI rates in "How the estimate is built".
  async redirects() {
    return [
      {
        source: '/methodology.html',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/guides/prsi.html',
        destination: '/',
        permanent: true,
      },
      {
        // Old static page said Class S is 4% "on income over €5,000", USC 4.5% and personal credit only.
        source: '/contractor-calculator-landing.html',
        destination: '/contractor-calculator',
        permanent: true,
      },
      {
        // Old static home page said "Most Class A employees pay 4% PRSI" and listed 2024 USC bands.
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      {
        // Old static USC guide listed 4.5% and €25,460 bands and no €13,000 exemption.
        source: '/guides/usc.html',
        destination: '/',
        permanent: true,
      },
      {
        // Old static about page; /about is current.
        source: '/about.html',
        destination: '/about',
        permanent: true,
      },
      {
        // Old generic sources list; /about has the live methodology and sources.
        source: '/data-sources.html',
        destination: '/about',
        permanent: true,
      },
      {
        // Old static copy of the cookies page.
        source: '/cookies.html',
        destination: '/cookies',
        permanent: true,
      },
      {
        // Old static copy of the privacy page.
        source: '/privacy.html',
        destination: '/privacy',
        permanent: true,
      },
      {
        // Old static copy of the terms page.
        source: '/terms.html',
        destination: '/terms',
        permanent: true,
      },
      {
        // Old static copy of the disclaimer page.
        source: '/disclaimer.html',
        destination: '/disclaimer',
        permanent: true,
      },
      {
        // Said 75% mortgage interest and a flat €600 rental credit; both out of date.
        source: '/rental-calculator-landing.html',
        destination: '/rental-calculator',
        permanent: true,
      },
      {
        // Thin generic BIK note; the small benefit page is the live BIK-related page.
        source: '/guides/bik.html',
        destination: '/small-benefit-exemption',
        permanent: true,
      },
      {
        // Generic note with no figures; the take-home page now explains the pension age limits and €115,000 cap.
        source: '/guides/pension-tax-relief.html',
        destination: '/',
        permanent: true,
      },
      {
        // Generic rental expenses note; nearest live page is the rental calculator.
        source: '/guides/rental-expenses.html',
        destination: '/rental-calculator',
        permanent: true,
      },
      {
        // Internal design page (shows 'PRSI 4%'); not for visitors.
        source: '/styleguide.html',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
