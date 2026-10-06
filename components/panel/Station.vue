<template>
  <!-- BEGIN - Station -->
  <div class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg my-3">
    <div
      class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg"
    >
      <h2 class="text-2xl dark:text-white">{{ $t(i18n) }}</h2>
    </div>
    <div class="flex items-center justify-center">
      <div
        class="grid grid-cols-4 gap-4 m-4 sm:grid-cols-4 md:grid-cols-8 sm:gap-1 sm:m-1"
      >
        <nuxt-link
          :to="`${data.url}`"
          v-for="data in results"
          :key="data.objectID"
          class="border tooltip tooltip-left"
          active-class="active border-red-700"
          :title="data.title"
          :data-tip="data.title"
          :class="[
            isRouteActive(data.objectID)
              ? 'border-red-700'
              : 'border-base-300 dark:border-gray-600 hover:border-purple-700 dark:hover:border-white hover:shadow-2xl hover:scale-105 transform transition-all duration-500',
          ]"
        >
          <img
            loading="lazy"
            :src="data.station_image"
            :alt="data.title"
            class="p-0 sm:p-1 md:p-5 lg:p-10"
          />
        </nuxt-link>
      </div>
    </div>
  </div>
  <!-- END - Station -->
</template>

<script lang="ts" setup>
interface StationResult {
  objectID: string;
  title?: string;
  station_name?: string;
  station_image: string;
  url: string;
}

const config = useRuntimeConfig();
const route = useRoute();
const emit = defineEmits<{
  (event: "update-data", data: StationResult): void;
}>();
const { result, search } = useAlgoliaSearch(config.public.algoliaIndexStation);
const results = ref<StationResult[]>([]);
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

const loadStations = async (): Promise<void> => {
  const currentVersion = ++requestVersion;
  const area = areaSlug.value;
  const country = countrySlug.value;
  const station = stationSlug.value;

  if (!area || !country || !station) {
    results.value = [];
    return;
  }

  try {
    await search({
      query: "",
      requestOptions: {
        hitsPerPage: 200,
        facetFilters: [
          `station_country:world.${area.replace(/-/g, "_")}.${country.replace(/-/g, "_")}`,
        ],
      },
    });

    if (currentVersion !== requestVersion) return;

    results.value = (result.value?.hits || []) as unknown as StationResult[];
    const activeData = results.value.find(
      (data) => data.objectID === `${country}-${station}`,
    );

    if (activeData) emit("update-data", activeData);
  } catch (error) {
    if (currentVersion !== requestVersion) return;
    results.value = [];
    console.error("Unable to load stations:", error);
  }
};

watch(
  () => [route.params.area, route.params.country, route.params.station],
  () => {
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
