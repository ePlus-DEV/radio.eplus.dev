<template>
  <div class="space-y-6">
    <Breadcrumbs
      :area="area"
      :level_1="i18n"
      :level_1_slug="slug"
      :level_2="streamName"
    />

    <section class="radio-surface relative overflow-hidden px-5 py-6 sm:px-7 lg:px-8">
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.10),transparent_48%)]"></div>
      <div class="relative grid gap-6 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:items-center">
        <div class="radio-themed-artwork flex aspect-square w-40 max-w-full items-center justify-center justify-self-start rounded-3xl border border-[var(--radio-border)] p-5 shadow-sm shadow-slate-900/5 sm:w-48 lg:w-56">
          <img
            :src="thumb || stationMeta?.features || config.public.placeholderStation"
            :alt="stationName"
            class="max-h-full max-w-full object-contain"
          />
        </div>

        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
              <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
              {{ $t("player.live") }}
            </span>
            <span class="rounded-full bg-[var(--radio-surface-soft)] px-2.5 py-1 text-xs font-medium text-[var(--radio-text-muted)]">{{ countryName }}</span>
          </div>
          <h1 dir="auto" class="mt-3 max-w-4xl text-3xl font-bold tracking-tight text-[var(--radio-text)] sm:text-4xl lg:text-5xl">
            {{ stationName }}
          </h1>
          <p
            dir="auto"
            class="mt-3 line-clamp-3 max-w-3xl text-sm leading-6 text-[var(--radio-text-muted)] sm:text-base sm:leading-7"
          >
            {{ seoDescription }}
          </p>

          <div class="mt-5 flex flex-wrap items-center gap-3">
            <UButton :icon="isActive && playback.playing ? 'i-lucide-pause' : 'i-lucide-play'" size="xl" class="radio-station-detail-action cursor-pointer rounded-full px-6" @click="playStation">
              {{ isActive && playback.playing ? $t('player.pause') : $t('player.play') }}
            </UButton>
            <UButton color="neutral" variant="soft" icon="i-lucide-list-music" class="hidden rounded-full 2xl:inline-flex" @click="playback.queueOpen = true">
              {{ $t('player.queue') }}
            </UButton>
          </div>

          <div class="mt-5 grid gap-2 text-xs text-[var(--radio-text-muted)] sm:grid-cols-3">
            <div class="rounded-2xl border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] px-3 py-2">
              <span class="block font-semibold text-[var(--radio-text)]">{{ countryName }}</span>
              <span>{{ areaName }}</span>
            </div>
            <div class="rounded-2xl border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] px-3 py-2">
              <span class="block font-semibold text-[var(--radio-text)]">{{ $t("panel.station_count", { count: stations.length }) }}</span>
              <span>{{ $t("panel.channels") }}</span>
            </div>
            <div class="rounded-2xl border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] px-3 py-2">
              <span class="block font-semibold text-[var(--radio-text)]">{{ $t("player.source_number", { number: sourceCount }) }}</span>
              <span>{{ $t("player.keep_listening") }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <PanelStation
      @select-station="playSelected"
      :stations="stations"
      :active-station-id="playingStationId"
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
const noIndex = Boolean(config.public.noIndex);

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
  () => t("seo.station_title", { station: stationName.value, country: countryName.value }),
);
const seoDescription = computed(
  () =>
    stationMeta.value?.description ||
    t("seo.station_description", { station: stationName.value, country: countryName.value }),
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
    { name: t("seo.home_breadcrumb"), path: "/" },
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
const playingStationId = computed(() =>
  playback.station?.url.startsWith(`/${area.value}/${slug.value}/`)
    ? playback.station.id
    : "",
);
const sourceCount = computed(() => {
  const meta = stationMeta.value;
  if (!meta) return 0;
  return 1 + (meta.streams?.length || 0) + Number(Boolean(meta.stream_alternative));
});

useHead(() => ({
  title: seoTitle.value,
  script: noIndex ? [] : [
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

useSeoMeta(() => noIndex ? {} : ({
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
  if (playback.station?.url === station.url && (playback.playing || playback.waiting)) {
    playback.pauseRequest += 1;
    return;
  }
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

