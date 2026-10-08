<template>
  <div class="space-y-6">
    <Breadcrumbs
      :area="area"
      :level_1="i18n"
      :level_1_slug="slug"
      :level_2="streamName"
    />

    <section class="radio-surface relative overflow-hidden px-5 py-5 sm:px-6">
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.09),transparent_42%)]"></div>
      <div class="relative flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div class="radio-themed-artwork flex h-16 w-20 shrink-0 items-center justify-center rounded-2xl border border-[var(--radio-border)] p-2 sm:h-20 sm:w-24">
          <img
            :src="thumb || stationMeta?.features || config.public.placeholderStation"
            :alt="stationName"
            class="max-h-full max-w-full object-contain"
          />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
              <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
              Live
            </span>
            <span class="text-xs text-slate-400">{{ countryName }}</span>
          </div>
          <h1 dir="auto" class="mt-2 line-clamp-2 text-2xl font-bold tracking-tight text-[var(--radio-text)] sm:text-3xl">
            {{ stationName }}
          </h1>
          <p
            dir="auto"
            class="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-[var(--radio-text-muted)]"
          >
            {{ seoDescription }}
          </p>
        </div>
      </div>
      <div class="relative mt-5 flex flex-wrap items-center gap-3">
        <UButton :icon="isActive && playback.playing ? 'i-lucide-pause' : 'i-lucide-play'" size="lg" class="rounded-full px-5" @click="playStation">
          {{ isActive && playback.playing ? $t('player.pause') : $t('player.play') }}
        </UButton>
        <span class="text-xs text-[var(--radio-text-muted)]">{{ $t('player.keep_listening') }}</span>
      </div>
    </section>

    <PanelStation
      @select-station="playSelected"
      :stations="stations"
      :active-station-id="stationSlug"
      :country-name="countryName"
    />

  </div>
</template>



<script setup lang="ts">
import type { RadioCatalogEntry as StationCatalogEntry, RadioStationOption } from "~/types/radio";
import { usePlaybackStore } from "~/stores/playback";
import { createPlaybackStation } from "~/utils/playback-station.mjs";
import {
  buildBreadcrumbSchema,
  buildRadioStationSchema,
} from "~/utils/seo-structured-data.mjs";

const route = useRoute();
const { t } = useI18n();
const config = useRuntimeConfig();

const normalizeParam = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] || "" : value || "";

const slug = computed(() => normalizeParam(route.params.country));
const area = computed(() => normalizeParam(route.params.area));
const stationSlug = computed(() => normalizeParam(route.params.station));
const i18n = computed(
  () =>
    `world.${area.value.replace(/-/g, "_")}.${slug.value.replace(/-/g, "_")}`,
);
const countryName = computed(() => t(i18n.value));

const stationCatalogUrl = computed(
  () => `/radio/${area.value}/${slug.value}.json`,
);
const stationCatalogKey = computed(
  () => `station-catalog:${area.value}:${slug.value}`,
);

interface StationCatalogPayload {
  key: string;
  stations: Record<string, StationCatalogEntry>;
}

const { data: stationCatalogPayload, error: stationCatalogError } =
  await useAsyncData<StationCatalogPayload>(
  stationCatalogKey,
  async () => {
    const key = stationCatalogKey.value;

    try {
      let stations: Record<string, StationCatalogEntry>;

      if (import.meta.server) {
        const [{ readFile }, { join }] = await Promise.all([
          import("node:fs/promises"),
          import("node:path"),
        ]);
        const file = join(
          process.cwd(),
          "public",
          "radio",
          area.value,
          `${slug.value}.json`,
        );
        stations = JSON.parse(
          await readFile(file, "utf8"),
        ) as Record<string, StationCatalogEntry>;
      } else {
        stations = await $fetch<Record<string, StationCatalogEntry>>(
          stationCatalogUrl.value,
        );
      }

      return { key, stations };
    } catch {
      throw createError({
        statusCode: 404,
        statusMessage: "Radio country not found",
      });
    }
  },
  {
    default: () => ({ key: "", stations: {} }),
  },
);

if (stationCatalogError.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Radio country not found",
  });
}

const stationCatalog = computed<Record<string, StationCatalogEntry>>(() =>
  stationCatalogPayload.value?.key === stationCatalogKey.value
    ? stationCatalogPayload.value.stations
    : {},
);
const stationMeta = computed(
  () => stationCatalog.value[stationSlug.value],
);

if (!stationMeta.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Radio station not found",
  });
}

const stations = computed<RadioStationOption[]>(() =>
  Object.entries(stationCatalog.value || {}).map(([stationId, station]) => ({
    id: stationId,
    title: station.title,
    image:
      station.features || String(config.public.placeholderStation),
    url: `/${area.value}/${slug.value}/${stationId}`,
  })),
);

const siteUrl = computed(() => String(config.public.siteUrl).replace(/\/$/, ""));
const areaName = computed(() =>
  t(`world.${area.value.replace(/-/g, "_")}.name`),
);
const stationPath = computed(
  () => `/${area.value}/${slug.value}/${stationSlug.value}`,
);
const stationName = computed(
  () =>
    stationMeta.value?.title ||
    stationSlug.value
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
);
const seoTitle = computed(
  () => `${stationName.value} Live Radio - ${countryName.value}`,
);
const seoDescription = computed(
  () =>
    stationMeta.value?.description ||
    `Listen to ${stationName.value} live from ${countryName.value} on Radio ePlus.`,
);
const seoImage = computed(() => {
  const image = stationMeta.value?.features;
  if (!image) return `${siteUrl.value}/brand/logo-share.png`;
  return image.startsWith("http") ? image : `${siteUrl.value}${image}`;
});
const canonicalUrl = computed(
  () => `${siteUrl.value}${stationPath.value}`,
);
const breadcrumbSchema = computed(() =>
  buildBreadcrumbSchema(siteUrl.value, [
    { name: "Home", path: "/" },
    { name: areaName.value, path: `/${area.value}` },
    { name: countryName.value, path: `/${area.value}/${slug.value}` },
    { name: stationName.value, path: stationPath.value },
  ]),
);
const stationSchema = computed(() =>
  buildRadioStationSchema({
    siteUrl: siteUrl.value,
    path: stationPath.value,
    name: stationName.value,
    description: seoDescription.value,
    image: seoImage.value,
  }),
);

const playback = usePlaybackStore();
const streamName = computed(() => stationName.value);
const thumb = computed(() => stationMeta.value?.features || String(config.public.placeholderStation));
const isActive = computed(() => playback.station?.url === stationPath.value);

useHead(() => ({
  title: seoTitle.value,
  script: [
    {
      key: "station-breadcrumb-schema",
      type: "application/ld+json",
      innerHTML: JSON.stringify(breadcrumbSchema.value),
    },
    {
      key: "radio-station-schema",
      type: "application/ld+json",
      innerHTML: JSON.stringify(stationSchema.value),
    },
  ],
}));

useSeoMeta(() => ({
  description: seoDescription.value,
  ogTitle: seoTitle.value,
  ogDescription: seoDescription.value,
  ogUrl: canonicalUrl.value,
  ogImage: seoImage.value,
  ogImageAlt: `${stationName.value} radio station artwork`,
  twitterTitle: seoTitle.value,
  twitterDescription: seoDescription.value,
  twitterImage: seoImage.value,
  twitterImageAlt: `${stationName.value} radio station artwork`,
}));

const activateStation = (autoplay = false): void => {
  const meta = stationMeta.value;
  if (!meta) return;
  playback.activate(createPlaybackStation({
    area: area.value, country: slug.value, id: stationSlug.value, meta,
    corsServer: String(config.public.corsServer || ''),
    placeholder: String(config.public.placeholderStation),
  }), stations.value, { autoplay });
};

const playStation = (): void => {
  if (isActive.value && (playback.playing || playback.waiting)) playback.pauseRequest += 1;
  else activateStation(true);
};

const playSelected = (station: RadioStationOption): void => {
  const meta = stationCatalog.value[station.id];
  if (!meta) return;
  playback.activate(createPlaybackStation({
    area: area.value, country: slug.value, id: station.id, meta,
    corsServer: String(config.public.corsServer || ''),
    placeholder: String(config.public.placeholderStation),
  }), stations.value, { autoplay: true });
};

// Only a station selection changes playback. Leaving this page does not own
// audio teardown or stop the application-level schedule polling.
watch(stationMeta, (meta) => { if (meta) activateStation(); }, { immediate: true });
</script>

