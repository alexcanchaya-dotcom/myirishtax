import { defineCloudflareConfig } from '@opennextjs/cloudflare/config';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

// No ISR in this app, so prerendered pages are served from Workers static assets (no R2 needed).
// `npm run cf:deploy` runs `opennextjs-cloudflare deploy`, which also fills this cache.
export default defineCloudflareConfig({ incrementalCache: staticAssetsIncrementalCache });
