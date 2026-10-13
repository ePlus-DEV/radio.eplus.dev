/**
 * Enable GA4 for the canonical production origin, independent of SEO indexing.
 *
 * The temporary Pages production artifact is intentionally noindex during the
 * hosting/DNS cutover. noindex controls search engines, NOT site analytics.
 * Staging and previews are blocked by their build-time origin and the
 * client-side location.hostname check in plugins/ga4.client.ts.
 */
export const GA4_MEASUREMENT_ID = 'G-ETDY41KBBJ';

export function isGa4ProductionBuild({ nodeEnv = '', siteUrl = '' } = {}) {
  if (nodeEnv !== 'production') return false;
  try {
    const url = new URL(String(siteUrl));
    return url.origin === 'https://radio.eplus.dev'
      && (url.pathname === '/' || url.pathname === '')
      && !url.search && !url.hash;
  } catch {
    return false;
  }
}
