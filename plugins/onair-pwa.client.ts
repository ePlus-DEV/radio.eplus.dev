/**
 * Installable PWA shell for generated GitHub Pages deployments.
 * Registration is scope-limited to each deployment base path, including
 * isolated /pr-preview/pr-N/ URLs. No automatic reload during playback.
 */
export default defineNuxtPlugin(() => {
  if (import.meta.dev || !import.meta.client || !('serviceWorker' in navigator)) return;

  const serviceWorkerUrl = useSiteAssetUrl()('/service-worker.js');
  const scope = useRuntimeConfig().app.baseURL || '/';
  const register = () => {
    void navigator.serviceWorker.register(serviceWorkerUrl, { scope })
      .catch(() => { /* Install support is optional; normal web listening remains available. */ });
  };

  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
});
