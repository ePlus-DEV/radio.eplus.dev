<template>
  <div class="space-y-7">
    <section
      class="radio-hero relative isolate overflow-hidden rounded-[2rem] px-5 py-8 text-white sm:px-8 sm:py-10 lg:px-10 lg:py-12"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_22%,rgba(236,72,153,0.50),transparent_35%),radial-gradient(circle_at_20%_90%,rgba(59,130,246,0.26),transparent_42%)]"
      ></div>

      <div class="pointer-events-none absolute -right-16 top-1/2 hidden h-72 w-72 -translate-y-1/2 rounded-full border-[32px] border-white/10 opacity-70 blur-[1px] lg:block" aria-hidden="true"></div>
      <div class="pointer-events-none absolute right-7 top-1/2 hidden h-44 w-44 -translate-y-1/2 items-end justify-center gap-2 opacity-50 lg:flex" aria-hidden="true">
        <span v-for="bar in 17" :key="bar" class="w-1.5 rounded-full bg-gradient-to-t from-violet-300 to-pink-300" :style="{ height: `${14 + (bar * 37 % 80)}%` }"></span>
      </div>
      <div class="relative max-w-3xl">
        <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm">
          <span class="h-2 w-2 animate-pulse rounded-full bg-rose-500"></span>
          Live internet radio
        </div>

        <h1 class="max-w-xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Live radio from around the world
        </h1>
        <p class="mt-4 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
          Browse stations by region and country, discover local radio, and start listening instantly.
        </p>

        <div class="mt-6 flex flex-wrap gap-3">
          <a href="#featured-radio" class="radio-interactive inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-950/20 transition hover:bg-violet-400"><fa :icon="['fas', 'play']" /> Start listening</a>
          <a href="#explore-radio" class="radio-interactive inline-flex items-center rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">Explore countries</a>
        </div>
        <div class="mt-6 flex flex-wrap gap-2">
          <NuxtLink
            v-for="areaItem in areaItems"
            :key="areaItem.slug"
            :to="`/${areaItem.slug}`"
            class="radio-interactive group inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-sm"
          >
            <span>{{ $t(`world.${areaItem.key}.name`) }}</span>
            <span class="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] tabular-nums text-slate-200">
              {{ areaItem.count }}
            </span>
            <fa
              :icon="['fas', 'arrow-right']"
              class="h-3 w-3 text-slate-200 transition group-hover:translate-x-0.5 group-hover:text-white"
            />
          </NuxtLink>
        </div>
      </div>

      <div class="relative mt-7 grid grid-cols-3 gap-3 border-t border-white/20 pt-5 sm:max-w-xl">
        <div>
          <p class="text-xl font-bold tracking-tight text-white">
            {{ totalCountries }}
          </p>
          <p class="mt-1 text-xs text-slate-200">Countries</p>
        </div>
        <div>
          <p class="text-xl font-bold tracking-tight text-white">
            {{ areaItems.length }}
          </p>
          <p class="mt-1 text-xs text-slate-200">Regions</p>
        </div>
        <div>
          <p class="text-xl font-bold tracking-tight text-white">
            24/7
          </p>
          <p class="mt-1 text-xs text-slate-200">Streaming</p>
        </div>
      </div>
    </section>

    <section id="featured-radio" class="scroll-mt-28">
      <div class="mb-3 flex items-center justify-between px-1">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">
            Featured
          </p>
          <h2 class="mt-1 text-lg font-semibold tracking-tight text-[var(--radio-text)]">
            Start listening
          </h2>
        </div>
      </div>

      <PanelStation @select-station="playFeatured" :stations="featuredStations" :active-station-id="playback.station?.id" :country-name="$t('world.asia.' + featuredCountry.replace(/-/g, '_'))" />
    </section>

    <section id="explore-radio" class="scroll-mt-28">
      <div class="mb-3 px-1">
        <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">
          Explore
        </p>
        <h2 class="mt-1 text-xl font-semibold tracking-tight text-[var(--radio-text)]">
          Browse by country
        </h2>
      </div>
      <PanelRadio />
    </section>
  </div>
</template>

<script setup lang="ts">
import worldData from "~/data/world";
import type { RadioCatalogEntry, RadioStationOption } from "~/types/radio";
import { usePlaybackStore } from "~/stores/playback";
import { createPlaybackStation } from "~/utils/playback-station.mjs";
import { buildCollectionPageSchema } from "~/utils/seo-structured-data.mjs";

const runtimeConfig = useRuntimeConfig();
const { t } = useI18n();
const siteUrl = computed(() =>
  String(runtimeConfig.public.siteUrl).replace(/\/$/, ""),
);
const playback = usePlaybackStore();
const featuredCountry = String(runtimeConfig.public.pinChannelFavorites || 'viet-nam');
const { data: featuredCatalog } = await useAsyncData('featured-catalog', async () => {
  if (import.meta.server) {
    const { readFile } = await import('node:fs/promises');
    const { join } = await import('node:path');
    return JSON.parse(await readFile(join(process.cwd(), 'public/radio/asia', `${featuredCountry}.json`), 'utf8')) as Record<string, RadioCatalogEntry>;
  }
  return await $fetch<Record<string, RadioCatalogEntry>>(`/radio/asia/${featuredCountry}.json`);
});
const featuredEntries = computed(() => Object.entries(featuredCatalog.value || {}).sort((a, b) => Number(Boolean(b[1].favorite)) - Number(Boolean(a[1].favorite))));
const featuredStations = computed(() => featuredEntries.value.slice(0, 8).map(([id, station]) => ({
  id, title: station.title, image: station.features || String(runtimeConfig.public.placeholderStation), url: `/asia/${featuredCountry}/${id}`,
})));

const areaItems = computed(() =>
  Object.entries(worldData).map(([key, countries]) => ({
    key,
    slug: key.replace(/_/g, "-"),
    count: Object.keys(countries).length,
  })),
);

const totalCountries = computed(() =>
  areaItems.value.reduce((total, area) => total + area.count, 0),
);

const seoTitle = "Live Internet Radio Worldwide";
const seoDescription =
  "Listen to live internet radio from around the world. Browse stations by region and country and stream radio online with Radio ePlus.";

const homeCollectionSchema = computed(() =>
  buildCollectionPageSchema({
    siteUrl: siteUrl.value,
    path: "/",
    name: seoTitle,
    description: seoDescription,
    items: areaItems.value.map((item) => ({
      name: t(`world.${item.key}.name`),
      path: `/${item.slug}`,
    })),
  }),
);

useHead(() => ({
  title: seoTitle,
  script: [
    {
      key: "home-collection-schema",
      type: "application/ld+json",
      innerHTML: JSON.stringify(homeCollectionSchema.value),
    },
  ],
}));
useSeoMeta({
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
});

const playFeatured = (station: RadioStationOption): void => {
  const meta = featuredCatalog.value?.[station.id];
  if (!meta) return;
  const stations = featuredEntries.value.map(([id, entry]) => ({ id, title: entry.title, image: entry.features || String(runtimeConfig.public.placeholderStation), url: `/asia/${featuredCountry}/${id}` }));
  playback.activate(createPlaybackStation({
    area: 'asia', country: featuredCountry, id: station.id, meta,
    corsServer: String(runtimeConfig.public.corsServer || ''), placeholder: String(runtimeConfig.public.placeholderStation),
  }), stations, { autoplay: true });
};

watch(featuredCatalog, () => {
  const [id, meta] = featuredEntries.value[0] || [];
  if (!id || !meta) return;
  const stations = featuredEntries.value.map(([stationId, station]) => ({
    id: stationId, title: station.title, image: station.features || String(runtimeConfig.public.placeholderStation), url: `/asia/${featuredCountry}/${stationId}`,
  }));
  playback.activate(createPlaybackStation({
    area: 'asia', country: featuredCountry, id, meta,
    corsServer: String(runtimeConfig.public.corsServer || ''),
    placeholder: String(runtimeConfig.public.placeholderStation),
  }), stations, { onlyIfIdle: true });
}, { immediate: true });
</script>

