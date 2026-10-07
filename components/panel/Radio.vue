<template>
  <div>
    <!-- BEGIN - Skeleton -->
    <div v-if="loading">
      <div
        v-for="i in chooseTheArea ? 1 : 7"
        :key="i"
        class="my-3 w-full min-w-0 overflow-hidden rounded-lg bg-white dark:bg-gray-700"
      >
        <div
          class="rounded-t-lg border-b p-4 dark:border-gray-600 dark:bg-gray-900"
        >
          <h2 class="text-2xl dark:text-white animate-pulse">
            <div
              class="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"
            ></div>
          </h2>
        </div>
        <div class="flex items-center justify-center">
          <div
            class="grid w-full grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:p-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 animate-pulse"
          >
            <div
              v-for="n in 16"
              :key="n"
              class="aspect-[7/5] w-full rounded-lg bg-gray-200 dark:bg-gray-600"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <!-- END - Skeleton -->

    <!-- BEGIN - Result -->
    <div v-for="(continent, continentIndex) in world" :key="continentIndex">
      <div class="my-3 w-full min-w-0 overflow-hidden rounded-lg bg-white dark:bg-gray-700">
        <div
          class="rounded-t-lg border-b p-4 dark:border-gray-600 dark:bg-gray-900"
        >
          <h2 class="text-xl font-medium dark:text-white sm:text-2xl">
            {{ $t(`world.${continentIndex}.name`) }}
          </h2>
        </div>
        <div class="w-full p-3 sm:p-4">
          <div class="grid w-full min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            <nuxt-link
              v-for="country in continent"
              :key="country.url"
              class="indicator w-full min-w-0 overflow-hidden rounded-lg border border-base-300 dark:border-gray-600 hover:border-purple-700 dark:hover:border-white"
              :title="$t(country.name)"
              :aria-label="$t(country.name)"
              :to="country.url"
            >
              <div
                v-if="country.station_count !== null"
                class="indicator-item text-white badge badge-accent"
              >
                {{ country.station_count }}
              </div>
              <div class="flex aspect-[7/5] w-full min-w-0 items-center justify-center p-3">
                <img
                  loading="lazy"
                  :src="country.flag"
                  :alt="$t(country.name)"
                  class="max-h-full max-w-full object-contain"
                />
              </div>
            </nuxt-link>
          </div>
        </div>
      </div>
    </div>
    <!-- END - Result -->
  </div>
</template>

<script setup lang="ts">
import worldData from "~/data/world";

const props = defineProps<{
  chooseTheArea?: string;
}>();

interface Country {
  name: string;
  url: string;
  flag: string;
  station_count: number | null;
  category: string;
}

interface GroupedResults {
  [key: string]: Country[];
}

interface WorldCountry {
  name: string;
  flag: string;
}

const config = useRuntimeConfig();
const algoliaConfigured = computed(() => Boolean(config.public.algoliaConfigured));
const { result, search } = useAlgoliaSearch("world");
const ALGOLIA_TIMEOUT_MS = 5000;

const selectedArea = computed(() =>
  props.chooseTheArea?.replace(/-/g, "_"),
);

const createLocalWorld = (): GroupedResults => {
  const grouped: GroupedResults = {};

  for (const [areaKey, countries] of Object.entries(worldData)) {
    if (selectedArea.value && areaKey !== selectedArea.value) continue;

    const areaSlug = areaKey.replace(/_/g, "-");
    grouped[areaKey] = Object.entries(countries).map(
      ([countrySlug, source]) => {
        const country = source as WorldCountry;
        return {
          name: country.name,
          flag: country.flag,
          url: `/${areaSlug}/${countrySlug}`,
          station_count: null,
          category: areaKey,
        };
      },
    );
  }

  return grouped;
};

const world = ref<GroupedResults>(createLocalWorld());
const loading = computed(() => Object.keys(world.value).length === 0);

const loadLocalStationCounts = async (): Promise<void> => {
  const areaKey = selectedArea.value;
  if (!areaKey || !world.value[areaKey]) return;

  const areaSlug = areaKey.replace(/_/g, "-");
  await Promise.allSettled(
    world.value[areaKey].map(async (country) => {
      const countrySlug = country.url.split("/").pop();
      if (!countrySlug) return;

      try {
        const stations = await $fetch<Record<string, unknown>>(
          `/radio/${areaSlug}/${countrySlug}.json`,
        );
        country.station_count = Object.keys(stations || {}).length;
      } catch {
        // Keep the card visible even when one local catalog file cannot load.
      }
    }),
  );
};

const mergeAlgoliaResults = (): void => {
  for (const rawHit of result.value?.hits || []) {
    const hit = rawHit as unknown as Partial<Country>;
    const category = hit.category?.replace(/-/g, "_");
    if (!category || !world.value[category]) continue;

    const match = world.value[category].find(
      (country) =>
        country.url === hit.url ||
        country.name === hit.name,
    );

    if (match && typeof hit.station_count === "number") {
      match.station_count = hit.station_count;
    }
  }
};

const enrichFromAlgolia = async (): Promise<void> => {
  if (!algoliaConfigured.value) return;

  try {
    const completed = await Promise.race([
      search({
        query: "",
        requestOptions: { hitsPerPage: 100 },
      }).then(() => true),
      new Promise<boolean>((resolve) =>
        setTimeout(() => resolve(false), ALGOLIA_TIMEOUT_MS),
      ),
    ]);

    if (!completed) {
      console.warn("Algolia country metadata timed out; using local catalog.");
      return;
    }

    mergeAlgoliaResults();
  } catch (error) {
    console.error("Unable to enrich radio countries from Algolia:", error);
  }
};

onMounted(() => {
  void loadLocalStationCounts();
  void enrichFromAlgolia();
});
</script>
