<template>
  <div class="space-y-6">
    <Breadcrumbs
      :area="area"
      :level_1="i18n"
      :level_1_slug="slug"
    />

    <section class="radio-surface relative overflow-hidden px-5 py-6 sm:px-7">
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.10),transparent_42%)]"></div>
      <div class="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
        <div class="radio-themed-artwork flex h-20 w-24 shrink-0 items-center justify-center rounded-2xl border border-[var(--radio-border)] p-3 sm:h-24 sm:w-28">
          <img
            :src="countryFlag"
            :alt="countryName"
            class="max-h-full max-w-full object-contain"
          />
        </div>

        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">
            {{ $t("panel.radio_in", { name: countryName }) }}
          </p>
          <h1 class="mt-1 line-clamp-2 text-2xl font-bold tracking-tight text-[var(--radio-text)] sm:text-3xl">
            {{ countryName }}
          </h1>
          <p class="mt-2 text-sm text-[var(--radio-text-muted)]">
            {{ stationCount ? stationCount + " stations" : seoDescription }}
          </p>
        </div>
      </div>
    </section>

    <Player
      :country="i18n"
      :country-name="countryName"
      :thumb="playerThumb"
      :stream-name="streamName"
      :stream-url="streamUrl"
      :stream-urls="streamUrls"
      :playlist="playlist"
      :stations="stations"
      :active-station-id="activeStationId"
      :queue-loading="queueLoading"
      @select-station="selectStation"
    />

    <PanelStation
      :stations="stations"
      :active-station-id="activeStationId"
      :country-name="countryName"
    />
  </div>
</template>

<script setup lang="ts">
import type { RadioSource, RadioStationOption } from "~/types/radio";
import { normalizeScheduleUrl } from "~/utils/station-schedule.mjs";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
} from "~/utils/seo-structured-data.mjs";

interface ChannelStream {
  url: string;
  type?: string;
  cros?: boolean;
  source?: string;
  label?: string;
}

interface Channel {
  favorite?: boolean;
  title: string;
  description?: string;
  stream: string;
  streams?: ChannelStream[];
  stream_alternative?: string;
  type?: string;
  cros?: boolean;
  schedule?: string | boolean;
  features?: string;
}

interface Track {
  track_title: string;
  track_artist: string;
  track_image: string;
  track_played: number;
}

interface CountryCatalogPayload {
  key: string;
  stations: Record<string, Channel>;
}

const $store = useMainStore();
const dayjs = useDayjs();
const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();
const route = useRoute();

const normalizeParam = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] || "" : value || "";

const slug = computed(() => normalizeParam(route.params.country));
const country = computed(() => slug.value.replace(/-/g, "_"));
const area = computed(() => normalizeParam(route.params.area));
const i18n = computed(
  () => `world.${area.value.replace(/-/g, "_")}.${country.value}`,
);
const countryName = computed(() => t(i18n.value));
const countryFlag = computed(
  () => `/img/${area.value}/flags/${slug.value}.png`,
);
const siteUrl = computed(() =>
  String(runtimeConfig.public.siteUrl).replace(/\/$/, ""),
);
const countryPath = computed(() => `/${area.value}/${slug.value}`);
const countryUrl = computed(() => `${siteUrl.value}${countryPath.value}`);
const countryImage = computed(() => `${siteUrl.value}${countryFlag.value}`);

const catalogUrl = computed(
  () => `/radio/${area.value}/${slug.value}.json`,
);
const catalogKey = computed(
  () => `country-catalog:${area.value}:${slug.value}`,
);

const { data: catalogPayload } = await useAsyncData<CountryCatalogPayload>(
  catalogKey,
  async () => {
    const key = catalogKey.value;

    try {
      let data: Record<string, Channel>;

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
        data = JSON.parse(await readFile(file, "utf8")) as Record<
          string,
          Channel
        >;
      } else {
        data = await $fetch<Record<string, Channel>>(catalogUrl.value);
      }

      return { key, stations: data };
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

const catalog = computed<Record<string, Channel>>(() =>
  catalogPayload.value?.key === catalogKey.value
    ? catalogPayload.value.stations
    : {},
);

const stationEntries = computed(() => Object.entries(catalog.value));
const stations = computed<RadioStationOption[]>(() =>
  stationEntries.value.map(([stationId, channel]) => ({
    id: stationId,
    title: channel.title,
    image:
      channel.features || String(runtimeConfig.public.placeholderStation),
    url: `${countryPath.value}/${stationId}`,
  })),
);
const stationCount = computed(() => stations.value.length);
const defaultStationId = computed(() => {
  const favorite = stationEntries.value.find(([, channel]) => channel.favorite);
  return favorite?.[0] || stationEntries.value[0]?.[0] || "";
});

const streamName = ref("");
const playerThumb = ref(String(runtimeConfig.public.placeholderStation));
const streamUrl = ref<RadioSource>({ src: "", type: "audio/mpeg" });
const streamUrls = ref<RadioSource[]>([]);
const activeStationId = ref("");
const playlist = ref<Track[]>([]);
const queueLoading = ref(false);

let scheduleTimer: ReturnType<typeof setTimeout> | null = null;
let scheduleVersion = 0;
let clientReady = false;
const POLL_INTERVAL = 60_000;

const seoTitle = computed(() => `Live Radio in ${countryName.value}`);
const seoDescription = computed(() =>
  stationCount.value > 0
    ? `Listen to ${stationCount.value} live internet radio stations from ${countryName.value}. Browse local stations and stream radio online on Radio ePlus.`
    : `Listen to live internet radio stations from ${countryName.value} on Radio ePlus.`,
);
const breadcrumbSchema = computed(() =>
  buildBreadcrumbSchema(siteUrl.value, [
    { name: "Home", path: "/" },
    {
      name: t(`world.${area.value.replace(/-/g, "_")}.name`),
      path: `/${area.value}`,
    },
    { name: countryName.value, path: countryPath.value },
  ]),
);
const countryCollectionSchema = computed(() =>
  buildCollectionPageSchema({
    siteUrl: siteUrl.value,
    path: countryPath.value,
    name: seoTitle.value,
    description: seoDescription.value,
    items: stations.value.map((station) => ({
      name: station.title,
      path: station.url || countryPath.value,
    })),
  }),
);

useHead(() => ({
  title: seoTitle.value,
  script: [
    {
      key: "country-breadcrumb-schema",
      type: "application/ld+json",
      innerHTML: JSON.stringify(breadcrumbSchema.value),
    },
    {
      key: "country-collection-schema",
      type: "application/ld+json",
      innerHTML: JSON.stringify(countryCollectionSchema.value),
    },
  ],
}));

useSeoMeta(() => ({
  description: seoDescription.value,
  ogTitle: seoTitle.value,
  ogDescription: seoDescription.value,
  ogUrl: countryUrl.value,
  ogImage: countryImage.value,
  ogImageAlt: `${countryName.value} flag`,
  twitterTitle: seoTitle.value,
  twitterDescription: seoDescription.value,
  twitterImage: countryImage.value,
  twitterImageAlt: `${countryName.value} flag`,
}));

const scheduleRequestUrl = (url: string): string =>
  /[?&](?:time|timestamp)=$/i.test(url)
    ? `${url}${dayjs().tz($store.getTimezone).unix()}`
    : url;

const clearSchedule = (): void => {
  scheduleVersion += 1;
  if (scheduleTimer) {
    clearTimeout(scheduleTimer);
    scheduleTimer = null;
  }
  queueLoading.value = false;
};

const resetPlayer = (): void => {
  activeStationId.value = "";
  streamName.value = "";
  playerThumb.value = String(runtimeConfig.public.placeholderStation);
  streamUrls.value = [];
  streamUrl.value = { src: "", type: "audio/mpeg" };
  playlist.value = [];
};

const toSources = (channel: Channel): RadioSource[] => {
  const seen = new Set<string>();
  const candidates: ChannelStream[] = [
    {
      url: channel.stream,
      type: channel.type || "audio/mpeg",
      cros: Boolean(channel.cros),
      source: "primary",
    },
    ...(channel.streams || []),
    ...(channel.stream_alternative
      ? [{ url: channel.stream_alternative, source: "alternative" }]
      : []),
  ].filter((item) => {
    const url = String(item.url || "").trim();
    if (!/^https?:\/\//i.test(url) || seen.has(url)) return false;
    seen.add(url);
    return true;
  });

  return candidates.map((item) => ({
    src: item.cros
      ? `${runtimeConfig.public.corsServer || ""}${item.url}`
      : item.url,
    type: item.type || "audio/mpeg",
    source: item.source,
    label: item.label,
    proxied: Boolean(item.cros),
  }));
};

const fetchSchedule = async (
  url: string,
  version: number,
  initial = false,
): Promise<void> => {
  if (!import.meta.client || !clientReady) return;
  if (initial) queueLoading.value = true;

  try {
    const resData = await $fetch(scheduleRequestUrl(url));
    if (version !== scheduleVersion) return;

    const value = resData as { success?: boolean; result?: Track[] };
    playlist.value =
      value.success && Array.isArray(value.result) ? value.result : [];
  } catch (error) {
    if (version === scheduleVersion) {
      playlist.value = [];
      console.error("Unable to load station schedule:", error);
    }
  } finally {
    if (version === scheduleVersion && initial) {
      queueLoading.value = false;
    }
  }

  if (version !== scheduleVersion || !clientReady) return;
  scheduleTimer = setTimeout(() => {
    void fetchSchedule(url, version);
  }, POLL_INTERVAL);
};

const applyChannel = (stationId: string, channel: Channel): void => {
  clearSchedule();
  $store.setTimezone(area.value, slug.value);

  activeStationId.value = stationId;
  streamName.value = channel.title;
  playerThumb.value =
    channel.features || String(runtimeConfig.public.placeholderStation);
  streamUrls.value = toSources(channel);
  streamUrl.value =
    streamUrls.value[0] || ({ src: "", type: "audio/mpeg" } as RadioSource);
  playlist.value = [];

  const scheduleUrl = normalizeScheduleUrl(channel.schedule);
  if (import.meta.client && clientReady && scheduleUrl) {
    const version = scheduleVersion;
    void fetchSchedule(scheduleUrl, version, true);
  }
};

const activateDefaultStation = (): void => {
  const stationId = defaultStationId.value;
  const channel = stationId ? catalog.value[stationId] : undefined;

  if (!stationId || !channel) {
    clearSchedule();
    resetPlayer();
    return;
  }

  applyChannel(stationId, channel);
};

const selectStation = (station: RadioStationOption): void => {
  const channel = catalog.value[station.id];
  if (!channel) return;
  applyChannel(station.id, channel);
};

watch(
  () => [catalogPayload.value?.key, area.value, slug.value] as const,
  () => {
    activateDefaultStation();
  },
  { immediate: true },
);

onMounted(() => {
  clientReady = true;

  const current =
    catalog.value[activeStationId.value] ||
    catalog.value[defaultStationId.value];
  if (current) {
    applyChannel(
      activeStationId.value || defaultStationId.value,
      current,
    );
  }
});

onBeforeUnmount(() => {
  clientReady = false;
  clearSchedule();
});
</script>
