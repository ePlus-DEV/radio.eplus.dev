import { usePlaybackStore } from '~/stores/playback';
import { resolveAuthorizedAppleStream } from '~/utils/global-radio-resolver.mjs';

// Keeps a licensed HLS stream current while its shared player remains mounted.
// One refresh timer at app scope, not one timer per route/card. No local storage.
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const playback = usePlaybackStore();
  const endpoint = String(config.public.globalRadioResolverUrl || '');
  if (!endpoint) return;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let currentRequest: AbortController | null = null;
  let generation = 0;

  async function refresh(lease: NonNullable<typeof playback.globalRadioLease>, version: number) {
    currentRequest?.abort();
    const controller = new AbortController();
    currentRequest = controller;
    try {
      const result = await resolveAuthorizedAppleStream({
        endpoint,
        station: { id: lease.stationId, listen_url: lease.listenUrl },
        signal: controller.signal,
      });
      if (version !== generation || controller.signal.aborted || !result.ok) return;
      playback.refreshGlobalRadioStream(lease.stationUrl, result.streamUrl, result.expiresAt);
    } catch {
      // On expiry/authorization failure stop attempting to reuse the old URL.
      // The listener can always open the official Apple/TuneIn destination.
      if (version === generation && !controller.signal.aborted) {
        if (playback.station?.url === lease.stationUrl) {
          playback.pauseRequest += 1;
          // Prevent the shared player from restarting an expired signed URL.
          playback.station = { ...playback.station, sources: [] };
        }
        playback.globalRadioLease = null;
      }
    } finally {
      if (currentRequest === controller) currentRequest = null;
    }
  }

  watch(
    () => [playback.globalRadioLease?.stationUrl, playback.globalRadioLease?.expiresAt, playback.station?.url] as const,
    () => {
      generation += 1;
      const version = generation;
      if (timer) clearTimeout(timer);
      currentRequest?.abort();
      timer = null;
      const lease = playback.globalRadioLease;
      if (!lease || playback.station?.url !== lease.stationUrl) return;
      // Refresh 40s before expiry, including paused tabs, so resumed playback
      // does not try to reuse a stale signed stream.
      const delay = Math.max(0, lease.expiresAt - Date.now() - 40_000);
      timer = setTimeout(() => { void refresh(lease, version); }, Math.min(delay, 2147483647));
    },
    { immediate: true },
  );
});
