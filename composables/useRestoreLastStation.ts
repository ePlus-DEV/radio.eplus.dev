import { useListeningStore } from '~/stores/listening';
import { usePlaybackStore } from '~/stores/playback';
import { useListenerPreferencesStore } from '~/stores/listenerPreferences';
import { createPlaybackStation } from '~/utils/playback-station.mjs';
import { canRestoreSavedStationOnRoute, createAppleRadioQueue, createAuthorizedApplePlaybackStation } from '~/utils/global-radio-station.mjs';
import { PUBLIC_APPLE_TUNEIN_STATIONS } from '~/utils/global-radio-public-tunein.mjs';
import type { GlobalRadioProvider } from '~/types/global-radio';
import type { RadioCatalogEntry } from '~/types/radio';

export function useRestoreLastStation() {
  const listening = useListeningStore();
  const playback = usePlaybackStore();
  const preferences = useListenerPreferencesStore();
  const route = useRoute();
  const config = useRuntimeConfig();
  const siteAssetUrl = useSiteAssetUrl();
  listening.hydrate();
  let disposed = false;
  onMounted(async () => {
    preferences.hydrate();
    if (!preferences.restoreStation || playback.pendingGlobalRadio) return;
    const saved = listening.library.lastStation;
    // Explicit station deep links take precedence over the saved station.
    if (!saved || !canRestoreSavedStationOnRoute(saved.url, route.path) || playback.playRequest
      || playback.requestedStationUrl || playback.playing || playback.station
      || playback.globalRadioPendingId) return;
    const path = route.fullPath;
    const request = playback.playRequest;

    // A Global HLS accessKey expires and must never be saved or silently
    // fetched on reload. Restore the verified station identity immediately,
    // even on its exact detail URL, without starting audio or any HLS lookup.
    // The next explicit Play resolves a fresh signed source.
    if (saved.url.startsWith('/global-radio/')) {
      const prefix = '/global-radio/apple-music/';
      if (!saved.url.startsWith(prefix)) return;
      const stationId = saved.url.slice(prefix.length);
      if (!Object.hasOwn(PUBLIC_APPLE_TUNEIN_STATIONS, stationId)) return;

      const restored = createAuthorizedApplePlaybackStation({
        id: stationId, title: saved.title, image: saved.image,
      }, '');
      restored.image = siteAssetUrl(restored.image);
      playback.activate(restored, [{
        id: stationId, title: restored.title, url: restored.url, image: restored.image,
      }], { autoplay: false, onlyIfIdle: true });
      if (playback.station?.url !== saved.url) return;

      // Enhance the Next/Previous queue from the PUBLIC catalog if available.
      // Never delay the selected station's display on CORS, provider or network.
      try {
        const provider = await $fetch<GlobalRadioProvider>(
          siteAssetUrl('/catalog/providers/apple-music.json'), { timeout: 10_000 },
        );
        if (!provider.stations?.some(entry => entry.id === stationId)) return;
        if (disposed || route.fullPath !== path || playback.playRequest !== request
          || playback.station?.url !== saved.url || playback.station.sources.length
          || playback.pendingGlobalRadio || playback.playing || playback.globalRadioPendingId
          || playback.requestedStationUrl) return;
        const queue = createAppleRadioQueue(provider.stations);
        for (const item of queue) item.image = siteAssetUrl(item.image);
        playback.activate(playback.station, queue, { autoplay: false });
      } catch { /* The selected station remains visible offline. */ }
      return;
    }
    const [, area, country, id] = saved.url.split('/');
    playback.activate({
      id,
      area,
      country,
      title: saved.title,
      image: saved.image,
      url: saved.url,
      countryKey: saved.countryKey || `world.${area.replace(/-/g, '_')}.${country.replace(/-/g, '_')}`,
      schedule: '',
      sources: [],
    }, [], { autoplay: false, onlyIfIdle: true });
    if (playback.station?.url !== saved.url) return;
    try {
      const catalog = await $fetch<Record<string, RadioCatalogEntry>>(siteAssetUrl(`/radio/${area}/${country}.json`), { timeout: 10_000 });
      if (playback.pendingGlobalRadio) return;
      if (disposed || route.fullPath !== path || playback.playRequest !== request || playback.requestedStationUrl || playback.station?.url !== saved.url || playback.playing || playback.globalRadioPendingId) return;
      const meta = catalog[id];
      if (!meta || !meta.stream) return;
      const options = Object.entries(catalog).map(([key, entry]) => ({ id: key, title: entry.title, image: entry.features || '/brand/onair-mark.svg', url: `/${area}/${country}/${key}` }));
      playback.activate(createPlaybackStation({ area, country, id, meta,
        corsServer: String(config.public.corsServer || ''), placeholder: '/brand/onair-mark.svg',
      }), options, { autoplay: false });
    } catch { /* A removed station or offline catalog must not break the page. */ }
  });
  onBeforeUnmount(() => { disposed = true; });
}
