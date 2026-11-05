import { usePlaybackStore } from '~/stores/playback';
import { buildAuthorizedResolverRequest, resolveAuthorizedAppleStream } from '~/utils/global-radio-resolver.mjs';
import { buildPublicTuneInRequest, resolvePublicTuneInStream } from '~/utils/global-radio-public-tunein.mjs';
import { createAuthorizedApplePlaybackStation } from '~/utils/global-radio-station.mjs';
import type { GlobalRadioStation } from '~/types/global-radio';

export function useAuthorizedGlobalRadioPlayback() {
  const config = useRuntimeConfig();
  const playback = usePlaybackStore();
  const pendingStationId = ref('');
  const error = ref('');
  let activeController: AbortController | null = null;
  const endpoint = computed(() => String(config.public.globalRadioResolverUrl || ''));
  // The owner's existing CORS service already resolves signed Apple HLS using
  // TuneIn's public endpoint. No new backend or GitHub env var is required.
  const enabled = computed(() => Boolean(buildPublicTuneInRequest('apple-music-1')
    || buildAuthorizedResolverRequest(endpoint.value, 'apple-music-1')));

  async function play(station: GlobalRadioStation) {
    if (!import.meta.client || !enabled.value || pendingStationId.value) return;
    const controller = new AbortController();
    activeController = controller;
    pendingStationId.value = station.id;
    error.value = '';
    try {
      // Prefer the publicly available TuneIn stream through ePlus's existing
      // Heroku CORS server. An approved resolver (if configured) is fallback.
      let result;
      try {
        result = await resolvePublicTuneInStream({ station, signal: controller.signal });
      } catch (publicError) {
        if (!endpoint.value || controller.signal.aborted) throw publicError;
        result = await resolveAuthorizedAppleStream({
          endpoint: endpoint.value, station, signal: controller.signal,
        });
      }
      if (controller.signal.aborted || !result.ok) return;
      const source = createAuthorizedApplePlaybackStation(station, result.streamUrl);
      // Use the existing global PlayerSession; never mount a second audio element.
      playback.activateGlobalRadio(source, station.listen_url, result.expiresAt);
    } catch {
      if (!controller.signal.aborted) error.value = 'unavailable';
    } finally {
      if (activeController === controller) {
        activeController = null;
        pendingStationId.value = '';
      }
    }
  }
  onBeforeUnmount(() => {
    activeController?.abort();
    activeController = null;
  });
  return { enabled, play, pendingStationId, error };
}
