/**
 * Keep Google Analytics restricted to the canonical public website.
 * Nuxt preview/staging builds can use NODE_ENV=production too.
 */
export const GA4_MEASUREMENT_ID = 'G-ETDY41KBBJ';

export function isGa4ProductionBuild({ nodeEnv = '', siteUrl = '', noIndex = false } = {}) {
  if (nodeEnv !== 'production' || noIndex) return false;
  try {
    const url = new URL(String(siteUrl));
    return url.protocol === 'https:' && url.hostname === 'radio.eplus.dev';
  } catch {
    return false;
  }
}
