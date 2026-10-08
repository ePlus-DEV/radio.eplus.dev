import { useListeningStore } from '~/stores/listening';
import { usePlaybackStore } from '~/stores/playback';
import { createPlaybackStation } from '~/utils/playback-station.mjs';
import type { RadioCatalogEntry } from '~/types/radio';

export function useRestoreLastStation() {
  const listening = useListeningStore();
  const playback = usePlaybackStore();
  const route = useRoute();
  const config = useRuntimeConfig();
  listening.hydrate();
  let disposed = false;
  onMounted(async () => {
    const saved = listening.library.lastStation;
    // Explicit station deep links take precedence over the saved station.
    if (!saved || route.path.split('/').filter(Boolean).length >= 3 || playback.playRequest || playback.requestedStationUrl || playback.playing) return;
    const path = route.fullPath;
    const request = playback.playRequest;
    const selected = playback.station?.url;
    const [, area, country, id] = saved.url.split('/');
    try {
      const catalog = await $fetch<Record<string, RadioCatalogEntry>>(`/radio/${area}/${country}.json`, { timeout: 10_000 });
      if (disposed || route.fullPath !== path || playback.playRequest !== request || playback.requestedStationUrl || playback.station?.url !== selected || playback.playing) return;
      const meta = catalog[id];
      if (!meta || !meta.stream) return;
      const options = Object.entries(catalog).map(([key, entry]) => ({ id: key, title: entry.title, image: entry.features || '/brand/logo-share.png', url: `/${area}/${country}/${key}` }));
      playback.activate(createPlaybackStation({ area, country, id, meta,
        corsServer: String(config.public.corsServer || ''), placeholder: '/brand/logo-share.png',
      }), options, { autoplay: false });
    } catch { /* A removed station or offline catalog must not break the page. */ }
  });
  onBeforeUnmount(() => { disposed = true; });
}
