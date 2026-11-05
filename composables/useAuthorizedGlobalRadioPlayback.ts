import { usePlaybackStore } from '~/stores/playback';
import { buildAuthorizedResolverRequest, resolveAuthorizedAppleStream } from '~/utils/global-radio-resolver.mjs';
import { createAuthorizedApplePlaybackStation } from '~/utils/global-radio-station.mjs';
import type { GlobalRadioStation } from '~/types/global-radio';

export function useAuthorizedGlobalRadioPlayback() {
  const config = useRuntimeConfig();
  const playback = usePlaybackStore();
  const pendingStationId = ref('');
  const error = ref('');
  let activeController: AbortController | null = null;
  const endpoint = computed(() => String(config.public.globalRadioResolverUrl || ''));
  const enabled = computed(() => Boolean(buildAuthorizedResolverRequest(endpoint.value, 'apple-music-1')));

  async function play(station: GlobalRadioStation) {
    if (!import.meta.client || !enabled.value || pendingStationId.value) return;
    const controller = new AbortController();
    activeController = controller;
    pendingStationId.value = station.id;
    error.value = '';
    try {
      const result = await resolveAuthorizedAppleStream({
        endpoint: endpoint.value, station, signal: controller.signal,
      });
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
