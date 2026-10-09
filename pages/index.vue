<template>
  <div class="space-y-7 sm:space-y-8">
    <section class="radio-hero rounded-2xl">
      <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('home.title') }}</h1>
      <p class="mt-2 max-w-2xl text-sm leading-6 text-[var(--radio-text-muted)]">{{ $t('home.description') }}</p>
      <div class="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-rose-700 dark:text-rose-300">
        <a href="#featured-radio" class="radio-interactive rounded-lg py-2">{{ $t('home.start_listening') }}</a>
        <a href="#explore-radio" class="radio-interactive rounded-lg py-2">{{ $t('home.explore_countries') }} · {{ totalCountries }}</a>
      </div>
    </section>
    <section id="featured-radio" class="scroll-mt-24">
      <div class="mb-4 flex items-center justify-between"><h2 class="text-lg font-semibold">{{ $t('home.featured') }}</h2><span class="text-xs text-[var(--radio-text-muted)]">{{ $t('home.start_listening') }}</span></div>
      <PanelFeaturedStations @select-station="playFeatured" :stations="featuredStations" :active-station-url="playback.station?.url" />
    </section>
    <ClientOnly><PanelResumeCard /><PanelListeningLibrary compact /></ClientOnly>
    <section id="explore-radio" class="scroll-mt-24">
      <h2 class="mb-4 text-lg font-semibold">{{ $t('home.browse_country') }}</h2>
      <PanelRadio compact />
    </section>
  </div>
</template>

<script setup lang="ts">
import worldData from "~/data/world";
import type { RadioCatalogEntry, RadioStationOption } from "~/types/radio";
import { usePlaybackStore } from "~/stores/playback";
import { createPlaybackStation } from "~/utils/playback-station.mjs";
import { HOMEPAGE_FEATURED_STATION_PATHS, selectHomepageFeaturedStations } from "~/utils/featured-stations.mjs";
import { buildCollectionPageSchema } from "~/utils/seo-structured-data.mjs";

const runtimeConfig = useRuntimeConfig();
const noIndex = Boolean(runtimeConfig.public.noIndex);
const { t } = useI18n();
const siteUrl = computed(() =>
  String(runtimeConfig.public.siteUrl).replace(/\/$/, ""),
);
const playback = usePlaybackStore();
// Load only curated stations into the Nuxt payload, not entire country catalogs.
const featuredCountries = [...new Set(HOMEPAGE_FEATURED_STATION_PATHS.map(path => path.split('/').slice(0, 2).join('/')))];
const { data: featuredCatalogs } = await useAsyncData('homepage-featured-catalogs', async () => {
  const catalogs = await Promise.all(featuredCountries.map(async (country) => {
    let catalog: Record<string, RadioCatalogEntry>;
    if (import.meta.server) {
      const { readFile } = await import('node:fs/promises');
      const { join } = await import('node:path');
      catalog = JSON.parse(await readFile(join(process.cwd(), 'public/radio', `${country}.json`), 'utf8')) as Record<string, RadioCatalogEntry>;
    } else {
      catalog = await $fetch<Record<string, RadioCatalogEntry>>(`/radio/${country}.json`);
    }
    const ids = new Set(HOMEPAGE_FEATURED_STATION_PATHS
      .filter(path => path.startsWith(`${country}/`))
      .map(path => path.slice(country.length + 1)));
    return Object.fromEntries(Object.entries(catalog).filter(([id]) => ids.has(id))) as Record<string, RadioCatalogEntry>;
  }));
  return Object.fromEntries(featuredCountries.map((country, index) => [country, catalogs[index]])) as Record<string, Record<string, RadioCatalogEntry>>;
});
const featuredEntries = computed(() => selectHomepageFeaturedStations(featuredCatalogs.value || {}));
const featuredStations = computed<RadioStationOption[]>(() => featuredEntries.value.map(({ area, country, id, meta }) => ({
  id, title: meta.title, image: meta.features || String(runtimeConfig.public.placeholderStation), url: `/${area}/${country}/${id}`,
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

const seoTitle = computed(() => t("home.title"));
const seoDescription = computed(() => t("home.description"));

const homeCollectionSchema = computed(() =>
  buildCollectionPageSchema({
    siteUrl: siteUrl.value,
    path: "/",
    name: seoTitle.value,
    description: seoDescription.value,
    items: areaItems.value.map((item) => ({
      name: t(`world.${item.key}.name`),
      path: `/${item.slug}`,
    })),
  }),
);

useHead(() => ({
  title: seoTitle.value,
  script: noIndex ? [] : [
    {
      key: "home-collection-schema",
      type: "application/ld+json",
      innerHTML: JSON.stringify(homeCollectionSchema.value),
    },
  ],
}));
if (!noIndex) useSeoMeta({
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  twitterTitle: () => seoTitle.value,
  twitterDescription: () => seoDescription.value,
});

const playFeatured = (station: RadioStationOption): void => {
  const selected = featuredEntries.value.find(entry => `/${entry.path}` === station.url);
  if (!selected) return;

  // The featured-card button controls the existing player. Never restart
  // an already-playing stream just to pause it.
  if (playback.station?.url === station.url && playback.station.sources.length) {
    if (playback.playing || playback.waiting) playback.pauseRequest += 1;
    else playback.requestStation(station.url);
    return;
  }

  const { area, country, id, meta } = selected;
  playback.activate(createPlaybackStation({
    area, country, id, meta,
    corsServer: String(runtimeConfig.public.corsServer || ''),
    placeholder: String(runtimeConfig.public.placeholderStation),
  }), featuredStations.value, { autoplay: true });
};

watch(featuredCatalogs, () => {
  const first = featuredEntries.value[0];
  if (!first) return;
  playback.activate(createPlaybackStation({
    area: first.area, country: first.country, id: first.id, meta: first.meta,
    corsServer: String(runtimeConfig.public.corsServer || ''),
    placeholder: String(runtimeConfig.public.placeholderStation),
  }), featuredStations.value, { onlyIfIdle: true });
}, { immediate: true });
</script>

