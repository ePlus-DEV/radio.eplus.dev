<template>
  <div class="space-y-6">
    <div v-if="loading" class="space-y-6">
      <section
        v-for="i in chooseTheArea ? 1 : 3"
        :key="i"
        class="radio-surface overflow-hidden"
      >
        <div class="flex items-center justify-between border-b border-slate-200/70 px-4 py-4 dark:border-white/10 sm:px-5">
          <div class="h-5 w-36 animate-pulse rounded-full bg-slate-200 dark:bg-white/10"></div>
          <div class="h-4 w-12 animate-pulse rounded-full bg-slate-100 dark:bg-white/5"></div>
        </div>
        <div class="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:p-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <div
            v-for="n in 12"
            :key="n"
            class="aspect-[4/3] animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5"
          ></div>
        </div>
      </section>
    </div>

    <section
      v-for="(continent, continentIndex) in world"
      :key="continentIndex"
      class="radio-surface overflow-hidden"
    >
      <div
        class="flex items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-4 dark:border-white/10 sm:px-5"
      >
        <div class="min-w-0">
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">
            {{ $t("panel.country") }}
          </p>
          <h2 class="mt-1 truncate text-lg font-semibold tracking-tight text-slate-950 dark:text-white sm:text-xl">
            {{ $t(`world.${continentIndex}.name`) }}
          </h2>
        </div>
        <span
          class="badge badge-sm h-7 shrink-0 border-0 bg-[var(--radio-surface-soft)] px-2.5 text-xs font-medium tabular-nums text-[var(--radio-text-muted)]"
        >
          {{ continent.length }}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:p-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        <NuxtLink
          v-for="country in continent"
          :key="country.url"
          :to="country.url"
          class="card radio-themed-soft group min-w-0 overflow-hidden rounded-2xl border transition duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lg hover:shadow-slate-900/5 dark:hover:border-rose-400/30"
          :title="$t(country.name)"
          :aria-label="$t(country.name)"
        >
          <div class="radio-themed-artwork relative flex aspect-[4/3] items-center justify-center overflow-hidden p-4">
            <img
              loading="lazy"
              :src="country.flag"
              :alt="$t(country.name)"
              class="max-h-[72%] max-w-[78%] object-contain drop-shadow-sm transition duration-200 group-hover:scale-[1.04]"
            />
            <span
              v-if="country.station_count !== null"
              class="absolute right-2 top-2 rounded-full bg-slate-950/80 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur dark:bg-white/10"
            >
              {{ country.station_count }}
            </span>
          </div>

          <div class="flex min-w-0 items-center gap-2 border-t border-[var(--radio-border)] px-3 py-3">
            <span class="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
              {{ $t(country.name) }}
            </span>
            <fa
              :icon="['fas', 'arrow-right']"
              class="h-3 w-3 shrink-0 -translate-x-1 text-slate-300 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100 dark:text-slate-500"
            />
          </div>
        </NuxtLink>
      </div>
    </section>
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
