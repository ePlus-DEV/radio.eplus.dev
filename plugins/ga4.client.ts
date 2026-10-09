import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_KEY,
  canStartGa4,
} from '~/utils/ga4-config.mjs';

type Ga4Window = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
};

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const measurementId = String(config.public.ga4MeasurementId || '');

  // No listener, script, network request or tracking on dev, staging or previews.
  if (!config.public.ga4Enabled || !/^G-[A-Z0-9]+$/.test(measurementId)
      || window.location.hostname !== 'radio.eplus.dev') return;

  const gaWindow = window as Ga4Window;
  const disableKey = `ga-disable-${measurementId}`;
  const router = useRouter();
  let loaded = false;
  let lastPagePath = '';

  const permitted = () => canStartGa4({
    enabled: config.public.ga4Enabled,
    hostname: window.location.hostname,
    consent: window.localStorage.getItem(ANALYTICS_CONSENT_KEY),
  });

  const trackPageView = () => {
    if (!loaded || !permitted()) return;
    // Ignore hash-only changes such as /library#favorites.
    const path = window.location.pathname + window.location.search;
    if (path === lastPagePath) return;
    lastPagePath = path;
    gaWindow.gtag?.('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.origin + path,
      page_path: path,
    });
  };

  const applyConsent = () => {
    if (!permitted()) {
      (gaWindow as unknown as Record<string, unknown>)[disableKey] = true;
      lastPagePath = '';
      return;
    }

    (gaWindow as unknown as Record<string, unknown>)[disableKey] = false;
    if (!loaded) {
      loaded = true;
      gaWindow.dataLayer = gaWindow.dataLayer || [];
      gaWindow.gtag = (...args: unknown[]) => {
        gaWindow.dataLayer?.push(args);
      };
      gaWindow.gtag('js', new Date());
      // Client-side routes are tracked manually so the initial page is not double-counted.
      gaWindow.gtag('config', measurementId, { send_page_view: false });
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
    }
    trackPageView();
  };

  // Initial consent may already exist; do not load GA4 otherwise.
  applyConsent();

  window.addEventListener(ANALYTICS_CONSENT_EVENT, applyConsent);
  window.addEventListener('storage', (event) => {
    if (event.key === ANALYTICS_CONSENT_KEY) applyConsent();
  });

  router.afterEach(() => {
    void nextTick().then(trackPageView);
  });
  nuxtApp.hook('page:finish', trackPageView);
});
