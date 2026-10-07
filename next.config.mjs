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
    ];
  },
};

export default nextConfig;
