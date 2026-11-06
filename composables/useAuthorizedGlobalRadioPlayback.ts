import { usePlaybackStore } from '~/stores/playback';
import { buildAuthorizedResolverRequest, resolveAuthorizedAppleStream } from '~/utils/global-radio-resolver.mjs';
import { buildPublicTuneInRequest, resolvePublicTuneInStream } from '~/utils/global-radio-public-tunein.mjs';
import { createAuthorizedApplePlaybackStation, createAppleRadioQueue } from '~/utils/global-radio-station.mjs';
import type { GlobalRadioStation } from '~/types/global-radio';

export function useAuthorizedGlobalRadioPlayback(getStations: () => GlobalRadioStation[] = () => []) {
  const config = useRuntimeConfig();
  const siteAssetUrl = useSiteAssetUrl();
  const playback = usePlaybackStore();
  const pendingStationId = ref('');
  const error = ref('');
  let activeController: AbortController | null = null;
  let pendingAutoPlay = false;
  const endpoint = computed(() => String(config.public.globalRadioResolverUrl || ''));
  // Both routes are explicitly configured at build time; never use a hardcoded CORS origin.
  const corsServer = computed(() => String(config.public.corsServer || ''));
  const enabled = computed(() => Boolean(buildPublicTuneInRequest('apple-music-1', corsServer.value)
    || buildAuthorizedResolverRequest(endpoint.value, 'apple-music-1')));

  async function select(station: GlobalRadioStation, autoplay: boolean, onlyIfIdle = false) {
    if (!import.meta.client || !enabled.value || (onlyIfIdle && playback.station)) return;
    // Country switching is immediate. The Global lookup is asynchronous:
    // a newer explicit station choice must win, not be ignored while an
    // earlier TuneIn request is still pending.
    if (pendingStationId.value) {
      if (pendingStationId.value === station.id) {
        // The first channel is prepared silently. A user's subsequent Play
        // tap must upgrade that in-flight lookup to actual playback.
        if (autoplay) pendingAutoPlay = true;
        return;
      }
      activeController?.abort();
      activeController = null;
      pendingStationId.value = '';
      pendingAutoPlay = false;
    }
    error.value = '';
    const stationUrl = '/global-radio/apple-music/' + station.id;
    if (autoplay && playback.station?.url === stationUrl) {
      // Same semantics as Country Radio's station card: tap again to pause.
      if (playback.playing || playback.waiting) {
        playback.pauseRequest += 1;
        return;
      }
      // A paused, still-valid HLS stream resumes without resetting its
      // audio element or unnecessarily obtaining another short-lived token.
      if (playback.globalRadioLease?.stationUrl === stationUrl
        && playback.globalRadioLease.expiresAt > Date.now() + 45_000
        && playback.station.sources.length > 0) {
        playback.playRequest += 1;
        return;
      }
    }
    const controller = new AbortController();
    activeController = controller;
    pendingAutoPlay = autoplay;
    pendingStationId.value = station.id;
    if (!playback.station) {
      // The dock can display the selected station immediately, before the
      // signed HLS URL arrives. No fake playable audio source is created.
      playback.pendingGlobalRadio = {
        id: station.id,
        title: station.title,
        url: stationUrl,
        image: siteAssetUrl(station.image || '/brand/onair-mark.svg'),
      };
    }
    try {
      // Prefer configured ePlus CORS. An approved resolver (if configured) is fallback.
      let result;
      try {
        result = await resolvePublicTuneInStream({ station, corsServer: corsServer.value, signal: controller.signal });
      } catch (publicError) {
        if (!endpoint.value || controller.signal.aborted) throw publicError;
        result = await resolveAuthorizedAppleStream({
          endpoint: endpoint.value, station, signal: controller.signal,
        });
      }
      if (controller.signal.aborted || !result.ok || (onlyIfIdle && playback.station)) return;
      const source = createAuthorizedApplePlaybackStation(station, result.streamUrl);
      // The Preview site lives under /pr-preview/pr-N/; prefix local artwork
      // in the shared player/queue too, not just in the provider page cards.
      source.image = siteAssetUrl(source.image);
      const queue = createAppleRadioQueue(getStations());
      for (const item of queue) item.image = siteAssetUrl(item.image);
      // Use the existing global PlayerSession; never mount a second audio element.
      playback.activateGlobalRadio(source, station.listen_url, result.expiresAt, queue,
        { autoplay: pendingAutoPlay });
    } catch {
      if (!controller.signal.aborted) error.value = 'unavailable';
    } finally {
      if (activeController === controller) {
        if (playback.pendingGlobalRadio?.url === stationUrl) playback.pendingGlobalRadio = null;
        activeController = null;
        pendingAutoPlay = false;
        pendingStationId.value = '';
      }
    }
  }
  // Country Radio initializes its first channel without autoplay. Global
  // performs one lazy, metadata-only-first resolver lookup instead of a
  // seven-station prefetch. Explicit Play can promote the pending request.
  function prepare(station: GlobalRadioStation) {
    return select(station, false, true);
  }
  function play(station: GlobalRadioStation) {
    return select(station, true);
  }
  onBeforeUnmount(() => {
    activeController?.abort();
    activeController = null;
    pendingAutoPlay = false;
    if (playback.pendingGlobalRadio?.id === pendingStationId.value) {
      playback.pendingGlobalRadio = null;
    }
  });
  return { enabled, play, prepare, pendingStationId, error };
}
