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

// Cache each public project path separately; this executes only on the client.
const loaders = new Map<string, ReturnType<typeof createCachedLoader>>();
function loaderFor(url: string) {
  let loader = loaders.get(url);
  if (!loader) {
    loader = createCachedLoader(async () => {
      const items = await $fetch<StationSearchItem[]>(url, { timeout: 10_000 });
      if (!Array.isArray(items)) throw new Error('Invalid station search index');
      return markRaw(items);
    });
    loaders.set(url, loader);
  }
  return loader;
}

export function useStationSearchIndex() {
  const searchUrl = useSiteAssetUrl()('/search/stations.json');
  const index = shallowRef<StationSearchItem[]>([]);
  const loading = ref(true);
  const error = ref(false);
  let disposed = false;
  onMounted(async () => {
    try {
      const items = await loaderFor(searchUrl)();
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
