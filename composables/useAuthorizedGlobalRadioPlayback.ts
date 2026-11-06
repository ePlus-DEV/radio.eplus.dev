import { toRef } from 'vue';
import { usePlaybackStore } from '~/stores/playback';
import { buildAuthorizedResolverRequest, resolveAuthorizedAppleStream } from '~/utils/global-radio-resolver.mjs';
import { buildPublicTuneInRequest, resolvePublicTuneInStream } from '~/utils/global-radio-public-tunein.mjs';
import { createAuthorizedApplePlaybackStation, createAppleRadioQueue } from '~/utils/global-radio-station.mjs';
import type { GlobalRadioStation } from '~/types/global-radio';

// One browser-wide in-flight Global lookup. The request must outlive the
// directory/detail page that initiated Play because PlayerSession lives in
// app.vue, outside NuxtPage. This is never used for server-side fetching.
let activeController: AbortController | null = null;

export function useAuthorizedGlobalRadioPlayback(getStations: () => GlobalRadioStation[] = () => []) {
  const config = useRuntimeConfig();
  const siteAssetUrl = useSiteAssetUrl();
  const playback = usePlaybackStore();
  const pendingStationId = toRef(playback, 'globalRadioPendingId');
  const error = toRef(playback, 'globalRadioError');
  const endpoint = computed(() => String(config.public.globalRadioResolverUrl || ''));
  const corsServer = computed(() => String(config.public.corsServer || ''));
  const enabled = computed(() => Boolean(buildPublicTuneInRequest('apple-music-1', corsServer.value)
    || buildAuthorizedResolverRequest(endpoint.value, 'apple-music-1')));

  async function play(station: GlobalRadioStation) {
    if (!import.meta.client || !enabled.value) return;
    // Repeated taps during the same request do not issue duplicate lookups.
    if (activeController && pendingStationId.value === station.id) return;

    // A selection from another route/component supersedes the old request.
    activeController?.abort();
    activeController = null;
    pendingStationId.value = '';
    error.value = '';

    const stationUrl = '/global-radio/apple-music/' + station.id;
    if (playback.station?.url === stationUrl) {
      if (playback.playing || playback.waiting) {
        playback.pauseRequest += 1;
        return;
      }
      if (playback.globalRadioLease?.stationUrl === stationUrl
        && playback.globalRadioLease.expiresAt > Date.now() + 45_000
        && playback.station.sources.length > 0) {
        playback.playRequest += 1;
        return;
      }
    }

    const controller = new AbortController();
    activeController = controller;
    pendingStationId.value = station.id;
    const previousStationUrl = playback.station?.url || '';
    const previousRequestedUrl = playback.requestedStationUrl;
    // Capture public catalog data before the route is unmounted. No signed
    // URLs are stored in the queue or carried across route transitions.
    const queueMetadata = createAppleRadioQueue(getStations());
    if (!playback.station) {
      playback.pendingGlobalRadio = {
        id: station.id,
        title: station.title,
        url: stationUrl,
        image: siteAssetUrl(station.image || '/brand/onair-mark.svg'),
      };
    }

    try {
      let result;
      try {
        result = await resolvePublicTuneInStream({
          station, corsServer: corsServer.value, signal: controller.signal,
        });
      } catch (publicError) {
        if (!endpoint.value || controller.signal.aborted) throw publicError;
        result = await resolveAuthorizedAppleStream({
          endpoint: endpoint.value, station, signal: controller.signal,
        });
      }
      // Browsing /statistics is allowed; an actual newer station selection or
      // queue request is not. A late response must never override that action.
      if (controller.signal.aborted || activeController !== controller || !result.ok
        || (playback.station?.url || '') !== previousStationUrl
        || playback.requestedStationUrl !== previousRequestedUrl) return;
      const source = createAuthorizedApplePlaybackStation(station, result.streamUrl);
      source.image = siteAssetUrl(source.image);
      for (const item of queueMetadata) item.image = siteAssetUrl(item.image);
      playback.activateGlobalRadio(source, station.listen_url, result.expiresAt, queueMetadata);
    } catch {
      if (!controller.signal.aborted && activeController === controller) error.value = 'unavailable';
    } finally {
      if (activeController === controller) {
        if (playback.pendingGlobalRadio?.url === stationUrl) playback.pendingGlobalRadio = null;
        activeController = null;
        pendingStationId.value = '';
      }
    }
  }

  // Deliberately no onBeforeUnmount abort: an explicit Play is app-scoped,
  // not tied to the Global Radio page. Opening any page without clicking Play
  // does not resolve, select or prefetch any station.
  return { enabled, play, pendingStationId, error };
}
