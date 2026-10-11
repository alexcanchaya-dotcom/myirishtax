/**
 * Cloudflare Web Analytics beacon (manual setup, "Add the JS snippet ... before the ending body tag":
 * https://developers.cloudflare.com/web-analytics/get-started/). The site token comes from the
 * NEXT_PUBLIC_CF_BEACON_TOKEN env var; with no token nothing is rendered.
 */
export function CloudflareAnalytics() {
  const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
  if (!token) return null;
  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
