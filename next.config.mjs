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
    ];
  },
};

export default nextConfig;
