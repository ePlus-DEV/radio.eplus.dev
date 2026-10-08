<template>
  <div class="space-y-7 sm:space-y-8">
    <section class="radio-hero rounded-2xl">
      <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('home.title') }}</h1>
      <p class="mt-2 max-w-2xl text-sm leading-6 text-[var(--radio-text-muted)]">{{ $t('home.description') }}</p>
      <div class="mt-4 flex flex-wrap gap-4 text-xs font-medium text-violet-500">
        <a href="#featured-radio" class="radio-interactive rounded-lg py-2">{{ $t('home.start_listening') }}</a>
        <a href="#explore-radio" class="radio-interactive rounded-lg py-2">{{ $t('home.explore_countries') }} · {{ totalCountries }}</a>
      </div>
    </section>
    <ClientOnly><PanelResumeCard /><PanelListeningLibrary compact /></ClientOnly>
    <section id="featured-radio" class="scroll-mt-24">
      <div class="mb-4 flex items-center justify-between"><h2 class="text-lg font-semibold">{{ $t('home.featured') }}</h2><span class="text-xs text-[var(--radio-text-muted)]">{{ $t('home.start_listening') }}</span></div>
      <PanelFeaturedStations @select-station="playFeatured" :stations="featuredStations" :active-station-id="playback.station?.id" />
    </section>
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
import { selectVietnamFeaturedStations } from "~/utils/featured-stations.mjs";
import { buildCollectionPageSchema } from "~/utils/seo-structured-data.mjs";

const runtimeConfig = useRuntimeConfig();
const noIndex = Boolean(runtimeConfig.public.noIndex);
const { t } = useI18n();
const siteUrl = computed(() =>
  String(runtimeConfig.public.siteUrl).replace(/\/$/, ""),
);
const playback = usePlaybackStore();
// This homepage curation is intentionally Vietnam-specific; do not derive it
// from the configurable country favorite or an unverified alphabetic catalog.
const featuredCountry = 'viet-nam';
const { data: featuredCatalog } = await useAsyncData('featured-catalog', async () => {
  if (import.meta.server) {
    const { readFile } = await import('node:fs/promises');
    const { join } = await import('node:path');
    return JSON.parse(await readFile(join(process.cwd(), 'public/radio/asia', `${featuredCountry}.json`), 'utf8')) as Record<string, RadioCatalogEntry>;
  }
  return await $fetch<Record<string, RadioCatalogEntry>>(`/radio/asia/${featuredCountry}.json`);
});
const featuredEntries = computed(() => selectVietnamFeaturedStations(featuredCatalog.value || {}));
const featuredStations = computed(() => featuredEntries.value.map(([id, station]) => ({
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

