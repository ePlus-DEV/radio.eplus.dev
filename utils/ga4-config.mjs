/**
 * Keep Google Analytics restricted to the canonical public website.
 * Nuxt preview/staging builds often use NODE_ENV=production as well.
 */
export const GA4_MEASUREMENT_ID = 'G-ETDY41KBBJ';
export const ANALYTICS_CONSENT_KEY = 'radio:analytics-consent';
export const ANALYTICS_CONSENT_EVENT = 'radio:analytics-consent';

export function isGa4ProductionBuild({ nodeEnv = '', siteUrl = '', noIndex = false } = {}) {
  if (nodeEnv !== 'production' || noIndex) return false;
  try {
    const url = new URL(String(siteUrl));
    return url.protocol === 'https:' && url.hostname === 'radio.eplus.dev';
  } catch {
    return false;
  }
}

export function canStartGa4({ enabled = false, hostname = '', consent = '' } = {}) {
  return enabled === true && hostname === 'radio.eplus.dev' && consent === 'granted';
}

export function isAnalyticsDecision(value) {
  return value === 'granted' || value === 'denied';
}
