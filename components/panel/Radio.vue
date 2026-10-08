<template>
  <div class="space-y-6">
    <div v-if="loading" class="space-y-6">
      <section
        v-for="i in chooseTheArea ? 1 : 3"
        :key="i"
        class="radio-surface overflow-hidden"
      >
        <div class="flex items-center justify-between border-b border-[var(--radio-border)] px-4 py-4  sm:px-5">
          <div class="h-5 w-36 animate-pulse rounded-full bg-[var(--radio-border-strong)]"></div>
          <div class="h-4 w-12 animate-pulse rounded-full bg-[var(--radio-surface-soft)]"></div>
        </div>
        <div class="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 lg:grid-cols-4 2xl:grid-cols-5">
          <div
            v-for="n in 12"
            :key="n"
            class="aspect-[4/3] animate-pulse rounded-2xl bg-[var(--radio-surface-soft)]"
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
        class="flex items-center justify-between gap-3 border-b border-[var(--radio-border)] px-4 py-4  sm:px-5"
      >
        <div class="min-w-0">
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">
            {{ $t("panel.country") }}
          </p>
          <h2 class="mt-1 truncate text-lg font-semibold tracking-tight text-[var(--radio-text)] sm:text-xl">
            {{ $t(`world.${continentIndex}.name`) }}
          </h2>
        </div>
        <span
          class="inline-flex items-center rounded-full h-7 shrink-0 border-0 bg-[var(--radio-surface-soft)] px-2.5 text-xs font-medium tabular-nums text-[var(--radio-text-muted)]"
        >
          {{ continent.length }}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 lg:grid-cols-4 2xl:grid-cols-5">
        <NuxtLink
          v-for="country in continent"
          :key="country.url"
          :to="country.url"
          class="radio-station-card group min-w-0 overflow-hidden rounded-2xl border transition duration-200 hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-xl hover:shadow-slate-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          :title="$t(country.name)"
          :aria-label="$t(country.name)"
        >
          <div class="radio-themed-artwork relative flex aspect-square items-center justify-center overflow-hidden p-5">
            <img
              loading="lazy"
              :src="country.flag"
              :alt="$t(country.name)"
              class="max-h-[70%] max-w-[75%] object-contain drop-shadow-sm transition duration-300 group-hover:scale-[1.08]"
            />
            <span
              v-if="country.station_count !== null"
              class="absolute right-2 top-2 rounded-full bg-[var(--radio-inverse-bg)] px-2 py-1 text-[10px] font-semibold text-[var(--radio-inverse-text)] opacity-90 backdrop-blur"
            >
              {{ country.station_count }}
            </span>
          </div>

          <div class="flex min-w-0 items-center gap-2 border-t border-[var(--radio-border)] px-3 py-3">
            <span class="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--radio-text)]">
              {{ $t(country.name) }}
            </span>
            <fa
              :icon="['fas', 'arrow-right']"
              class="h-3 w-3 shrink-0 -translate-x-1 text-[var(--radio-text-muted)] opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100 "
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
