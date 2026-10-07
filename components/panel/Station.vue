<template>
  <!-- BEGIN - Station -->
  <div class="my-3 w-full min-w-0 overflow-hidden rounded-lg bg-white dark:bg-gray-700">
    <div
      class="flex flex-col gap-3 rounded-t-lg border-b p-4 dark:border-gray-600 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between"
    >
      <h2 class="text-xl font-medium dark:text-white sm:text-2xl">{{ $t(i18n) }}</h2>

      <label
        v-if="showLegacyDistrictFilter"
        class="flex min-w-0 flex-col gap-1 text-sm text-gray-600 dark:text-gray-300 sm:w-64"
      >
        <span class="font-medium">Quận / Huyện (địa chỉ cũ)</span>
        <select
          v-model="selectedDistrict"
          class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900 outline-none focus:border-purple-600 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Tất cả quận / huyện</option>
          <option v-for="district in legacyDistricts" :key="district" :value="district">
            {{ district }}
          </option>
        </select>
      </label>
    </div>

    <div class="w-full p-3 sm:p-4">
      <div
        class="grid w-full min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
      >
        <nuxt-link
          :to="`${data.url}`"
          v-for="data in results"
          :key="data.objectID"
          class="w-full min-w-0 overflow-hidden rounded-lg border"
          active-class="active border-red-700"
          :title="stationTitle(data)"
          :aria-label="stationTitle(data)"
          :class="[
            isRouteActive(data.objectID)
              ? 'border-red-600 ring-1 ring-red-500/40'
              : 'border-base-300 dark:border-gray-600 hover:border-purple-700 dark:hover:border-white hover:shadow-md',
          ]"
        >
          <div class="flex aspect-[16/11] w-full min-w-0 items-center justify-center p-2 sm:p-3">
            <img
              loading="lazy"
              :src="data.station_image"
              :alt="data.title"
              class="h-auto max-h-[66px] w-auto max-w-[96px] object-contain"
            />
          </div>
          <div
            v-if="getLegacyDistrict(data)"
            class="truncate border-t border-base-200 px-2 py-1.5 text-center text-[11px] text-gray-500 dark:border-gray-600 dark:text-gray-300"
          >
            {{ getLegacyDistrict(data) }}
          </div>
        </nuxt-link>
      </div>

      <p
        v-if="showLegacyDistrictFilter && results.length === 0"
        class="py-8 text-center text-sm text-gray-500 dark:text-gray-300"
      >
        Không có đài nào trong quận / huyện đã chọn.
      </p>
    </div>
  </div>
  <!-- END - Station -->
</template>

<script lang="ts" setup>
interface StationStream {
  url: string;
  type?: string;
  cros?: boolean;
  source?: string;
}

interface AddressBoundary {
  id?: string | number | null;
  name?: string | null;
}

interface StructuredAddress {
  full?: string | null;
  name?: string | null;
  province?: AddressBoundary | null;
  district?: AddressBoundary | null;
  ward?: AddressBoundary | null;
}

interface StationAddress {
  legacy?: StructuredAddress | null;
  current?: StructuredAddress | null;
  source?: string;
}

interface StationLocation {
  lat: number;
  lng: number;
}

interface StationResult {
  objectID: string;
  title: string;
  station_name: string;
  station_image: string;
  station_stream: string;
  station_streams?: StationStream[];
  station_schedule?: string;
  cros: boolean;
  type: string;
  url: string;
  location?: StationLocation;
  address?: StationAddress;
}

interface StationCatalogEntry {
  title: string;
  description?: string;
  type: string;
  cros: boolean;
  stream: string;
  streams?: StationStream[];
  features?: string;
  schedule?: string;
  location?: StationLocation;
  address?: StationAddress;
}

const config = useRuntimeConfig();
const route = useRoute();
const emit = defineEmits<{
  (event: "update-data", data: StationResult): void;
}>();

const allResults = ref<StationResult[]>([]);
const selectedDistrict = ref("");
let requestVersion = 0;

const normalizeParam = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] || "" : value || "";

const areaSlug = computed(() => normalizeParam(route.params.area));
const countrySlug = computed(() => normalizeParam(route.params.country));
const stationSlug = computed(() => normalizeParam(route.params.station));
const i18n = computed(
  () =>
    `world.${areaSlug.value.replace(/-/g, "_")}.${countrySlug.value.replace(/-/g, "_")}`,
);

const getLegacyDistrict = (station: StationResult): string =>
  String(station.address?.legacy?.district?.name || "").trim();

const legacyDistricts = computed(() =>
  [...new Set(allResults.value.map(getLegacyDistrict).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "vi")),
);

const showLegacyDistrictFilter = computed(
  () => countrySlug.value === "viet-nam" && legacyDistricts.value.length > 0,
);

const results = computed(() => {
  if (!selectedDistrict.value) return allResults.value;

  return allResults.value.filter(
    (station) => getLegacyDistrict(station) === selectedDistrict.value,
  );
});

const stationTitle = (station: StationResult): string => {
  const fullAddress = String(station.address?.legacy?.full || "").trim();
  return fullAddress ? `${station.title} — ${fullAddress}` : station.title;
};

const loadStations = async (): Promise<void> => {
  if (import.meta.server) return;

  const currentVersion = ++requestVersion;
  const area = areaSlug.value;
  const country = countrySlug.value;
  const station = stationSlug.value;

  if (!area || !country) {
    allResults.value = [];
    return;
  }

  try {
    const catalog = await $fetch<Record<string, StationCatalogEntry>>(
      `/radio/${area}/${country}.json`,
    );

    if (currentVersion !== requestVersion) return;

    allResults.value = Object.entries(catalog || {}).map(([stationKey, data]) => ({
      objectID: `${country}-${stationKey}`,
      title: data.title,
      station_name: data.title,
      station_image: data.features || String(config.public.placeholderStation),
      station_stream: data.stream,
      station_streams: data.streams,
      station_schedule: data.schedule,
      cros: Boolean(data.cros),
      type: data.type || "audio/mpeg",
      url: `/${area}/${country}/${stationKey}`,
      location: data.location,
      address: data.address,
    }));

    if (!station) return;

    const activeData = allResults.value.find(
      (data) => data.objectID === `${country}-${station}`,
    );

    if (activeData) emit("update-data", activeData);
  } catch (error) {
    if (currentVersion !== requestVersion) return;
    allResults.value = [];
    console.error("Unable to load local station catalog:", error);
  }
};

watch(
  () => [route.params.area, route.params.country, route.params.station],
  () => {
    selectedDistrict.value = "";
    void loadStations();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  requestVersion += 1;
});

const isRouteActive = (path: string): boolean =>
  path === `${countrySlug.value}-${stationSlug.value}`;
</script>
