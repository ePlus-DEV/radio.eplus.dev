/**
 * Cloudflare Pages Git integration supplies CF_PAGES_URL for each deployment.
 * Treat its value as untrusted: a preview build must never accidentally
 * produce indexable production HTML or send production analytics.
 */
export function createPrPreviewEnvironment(environment = {}) {
  if (environment.CF_PAGES !== '1') {
    throw new Error('PR preview builds run only inside Cloudflare Pages (CF_PAGES=1).');
  }

  let origin;
  try {
    const url = new URL(String(environment.CF_PAGES_URL || ''));
    if (url.protocol !== 'https:' ||
        !url.hostname.toLowerCase().endsWith('.pages.dev') ||
        url.port || url.username || url.password ||
        url.pathname !== '/' || url.search || url.hash) {
      throw new Error('Expected a root HTTPS *.pages.dev origin.');
    }
    origin = url.origin;
  } catch {
    throw new Error('Missing/invalid CF_PAGES_URL. Expected the current https://*.pages.dev deployment URL.');
  }

  return {
    ...environment,
    // Explicit previews policy wins over inherited production/staging settings.
    NUXT_PUBLIC_SITE_URL: origin,
    NUXT_PUBLIC_NO_INDEX: 'true',
    NUXT_APP_BASE_URL: '/',
    ONAIR_SKIP_STATION_OG: 'true',
    NUXT_PUBLIC_STATION_OG_BASE_URL: '',
  };
}
