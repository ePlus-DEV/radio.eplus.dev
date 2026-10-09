import { createCachedLoader } from '~/utils/cached-loader.mjs';

export interface StationSearchItem {
  objectID: string;
  station_name: string;
  station_country: string;
  country_label?: string;
  station_image: string;
  url: string;
  featured?: boolean;
}

// Called only after mounting the search modal; never fetch this catalog in SSR.
const loadIndex = createCachedLoader(async () => {
  const items = await $fetch<StationSearchItem[]>('/search/stations.json', { timeout: 10_000 });
  if (!Array.isArray(items)) throw new Error('Invalid station search index');
  return markRaw(items);
});

export function useStationSearchIndex() {
  const index = shallowRef<StationSearchItem[]>([]);
  const loading = ref(true);
  const error = ref(false);
  let disposed = false;
  onMounted(async () => {
    try {
      const items = await loadIndex();
      if (!disposed) index.value = items;
    } catch {
      if (!disposed) error.value = true;
    } finally {
      if (!disposed) loading.value = false;
    }
  });
  onBeforeUnmount(() => { disposed = true; });
  return { index, loading, error };
}
