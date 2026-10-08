<template>
  <section class="radio-surface my-6 overflow-hidden">
    <div
      class="flex items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-4 dark:border-white/10 sm:px-5"
    >
      <div class="min-w-0">
        <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">
          {{ $t("panel.play_from_radio") }}
        </p>
        <h2 class="mt-1 truncate text-lg font-semibold tracking-tight text-slate-950 dark:text-white sm:text-xl">
          {{ $t(i18n) }}
        </h2>
      </div>
      <span
        class="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium tabular-nums text-slate-500 dark:bg-white/5 dark:text-slate-400"
      >
        {{ results.length }}
      </span>
    </div>

    <div
      v-if="results.length"
      class="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:p-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    >
      <NuxtLink
        v-for="data in results"
        :key="data.objectID"
        :to="data.url"
        class="group min-w-0 overflow-hidden rounded-2xl border bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5 dark:bg-white/[0.03]"
        :class="
          isRouteActive(data.objectID)
            ? 'border-rose-300 ring-2 ring-rose-500/15 dark:border-rose-400/40'
            : 'border-slate-200/80 hover:border-rose-200 dark:border-white/10 dark:hover:border-rose-400/30'
        "
        :title="data.title"
        :aria-label="data.title"
      >
        <div class="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-50 p-3 dark:bg-slate-950/50">
          <img
            loading="lazy"
            :src="data.station_image"
            :alt="data.title"
            class="h-auto max-h-[66px] w-auto max-w-[96px] object-contain transition duration-200 group-hover:scale-[1.04]"
          />

          <span
            v-if="isRouteActive(data.objectID)"
            class="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm"
          >
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-white"></span>
            Live
          </span>

          <span
            class="absolute bottom-2 right-2 flex h-8 w-8 scale-90 items-center justify-center rounded-full bg-slate-950/80 text-white opacity-0 shadow transition group-hover:scale-100 group-hover:opacity-100 dark:bg-white dark:text-slate-950"
          >
            <fa :icon="['fas', 'play']" class="ml-0.5 h-3 w-3" />
          </span>
        </div>

        <div class="border-t border-slate-200/70 px-3 py-3 dark:border-white/10">
          <p class="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-700 dark:text-slate-200">
            {{ data.title }}
          </p>
        </div>
      </NuxtLink>
    </div>

    <div
      v-else
      class="px-5 py-10 text-center text-sm text-slate-400"
    >
      {{ $t("panel.updating") }}
    </div>
  </section>
</template>

<script lang="ts" setup>
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
}

interface StationStream {
  url: string;
  type?: string;
  cros?: boolean;
  source?: string;
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
}

const config = useRuntimeConfig();
const route = useRoute();
const emit = defineEmits<{
  (event: "update-data", data: StationResult): void;
}>();
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
  if (import.meta.server) return;

  const currentVersion = ++requestVersion;
  const area = areaSlug.value;
  const country = countrySlug.value;
  const station = stationSlug.value;

  if (!area || !country) {
    results.value = [];
    return;
  }

  try {
    const catalog = await $fetch<Record<string, StationCatalogEntry>>(
      `/radio/${area}/${country}.json`,
    );

    if (currentVersion !== requestVersion) return;

    results.value = Object.entries(catalog || {}).map(([stationKey, data]) => ({
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
    }));

    if (!station) return;

    const activeData = results.value.find(
      (data) => data.objectID === `${country}-${station}`,
    );

    if (activeData) emit("update-data", activeData);
  } catch (error) {
    if (currentVersion !== requestVersion) return;
    results.value = [];
    console.error("Unable to load local station catalog:", error);
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
