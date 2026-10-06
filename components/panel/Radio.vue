<template>
  <div>
    <!-- BEGIN - Skeleton -->
    <div v-if="loading">
      <div
        v-for="i in chooseTheArea ? 1 : 7"
        :key="i"
        class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg my-3"
      >
        <div
          class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg"
        >
          <h2 class="text-2xl dark:text-white animate-pulse">
            <div
              class="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"
            ></div>
          </h2>
        </div>
        <div class="flex items-center justify-center">
          <div
            class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 m-4 animate-pulse"
          >
            <div
              v-for="n in 16"
              :key="n"
              class="h-2.5 bg-gray-200 rounded-full dark:bg-gray-600 min-w-10 w-full sm:w-20 md:w-28 mb-4 m-2"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <!-- END - Skeleton -->

    <!-- BEGIN - Result -->
    <div v-for="(continent, continentIndex) in world" :key="continentIndex">
      <div class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg my-3">
        <div
          class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg"
        >
          <h2 class="text-2xl dark:text-white">
            {{ $t(`world.${continentIndex}.name`) }}
          </h2>
        </div>
        <div class="flex items-center justify-center">
          <div class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 m-4">
            <nuxt-link
              v-for="country in continent"
              :key="country.url"
              class="tooltip border border-base-300 dark:border-gray-600 hover:border-purple-700 dark:hover:border-white indicator"
              :data-tip="$t(country.name)"
              :to="country.url"
            >
              <div
                v-if="country.station_count !== null"
                class="indicator-item text-white badge badge-accent"
              >
                {{ country.station_count }}
              </div>
              <img
                loading="lazy"
                :src="country.flag"
                :alt="$t(country.name)"
                class="p-0 sm:p-1 md:p-5 lg:p-8"
              />
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
