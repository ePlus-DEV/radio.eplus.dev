type Ga4Window = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
};

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const measurementId = String(config.public.ga4MeasurementId || '');

  // The tracker is always on for the canonical production domain only.
  // NODE_ENV alone is insufficient because previews can be production builds.
  if (!config.public.ga4Enabled || !/^G-[A-Z0-9]+$/.test(measurementId)
      || window.location.hostname !== 'radio.eplus.dev') return;

  const gaWindow = window as Ga4Window;
  const router = useRouter();
  let lastPagePath = '';

  gaWindow.dataLayer = gaWindow.dataLayer || [];
  gaWindow.gtag = (...args: unknown[]) => {
    gaWindow.dataLayer?.push(args);
  };
  gaWindow.gtag('js', new Date());
  // Track routes manually to avoid GA4's automatic page_view duplicating SPA events.
  gaWindow.gtag('config', measurementId, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  const trackPageView = () => {
    const path = window.location.pathname + window.location.search;
    if (path === lastPagePath) return; // Hash-only navigation is not a new page view.
    lastPagePath = path;
    gaWindow.gtag?.('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.origin + path,
      page_path: path,
    });
  };

  // First client render and subsequent Nuxt SPA navigations.
  trackPageView();
  router.afterEach(() => {
    void nextTick().then(trackPageView);
  });
  nuxtApp.hook('page:finish', trackPageView);
});
