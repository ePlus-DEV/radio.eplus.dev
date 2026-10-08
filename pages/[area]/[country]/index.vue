<template>
  <div class="space-y-6">
    <Breadcrumbs
      :area="area"
      :level_1="i18n"
      :level_1_slug="slug"
    />

    <section class="radio-surface relative overflow-hidden px-5 py-6 sm:px-7">
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.10),transparent_42%)]"></div>
      <div class="relative flex items-center gap-4 sm:gap-5">
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
          <h1 class="mt-1 truncate text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            {{ countryName }}
          </h1>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
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

    <PanelStation />
  </div>
</template>

<script setup lang="ts">
import type { RadioSource, RadioStationOption } from "~/types/radio";

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
  stream: string;
  streams?: ChannelStream[];
  stream_alternative?: string;
  type?: string;
  cros?: boolean;
  schedule?: string;
  features?: string;
}

interface Track {
  track_title: string;
  track_artist: string;
  track_image: string;
  track_played: number;
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
  () => `world.${String(area.value).replace(/-/g, "_")}.${country.value}`,
);
const countryName = computed(() => t(i18n.value));
const countryFlag = computed(
  () =>
    `/img/${area.value || "asia"}/flags/${slug.value || "viet-nam"}.png`,
);

const streamName = ref("");
const playerThumb = ref(String(runtimeConfig.public.placeholderStation));
const streamUrl = ref<RadioSource>({ src: "", type: "audio/mpeg" });
const streamUrls = ref<RadioSource[]>([]);
const stations = ref<RadioStationOption[]>([]);
const activeStationId = ref("");
const catalog = ref<Record<string, Channel>>({});
const playlist = ref<Track[]>([]);
const stationCount = ref(0);
const queueLoading = ref(false);
const timeZone = ref($store.getTimezone);

let scheduleTimer: ReturnType<typeof setTimeout> | null = null;
let scheduleVersion = 0;
const POLL_INTERVAL = 60_000;

const seoTitle = computed(() => `Live Radio in ${countryName.value}`);
const seoDescription = computed(
  () =>
    `Listen to live internet radio stations from ${countryName.value}. Browse local stations and stream radio online on Radio ePlus.`,
);

useHead(() => ({ title: seoTitle.value }));
useSeoMeta(() => ({
  description: seoDescription.value,
  ogTitle: seoTitle.value,
  ogDescription: seoDescription.value,
  twitterTitle: seoTitle.value,
  twitterDescription: seoDescription.value,
}));

const scheduleRequestUrl = (url: string): string =>
  /[?&](?:time|timestamp)=$/i.test(url)
    ? `${url}${dayjs().tz(timeZone.value).unix()}`
    : url;

const clearSchedule = (): void => {
  scheduleVersion += 1;
  if (scheduleTimer) {
    clearTimeout(scheduleTimer);
    scheduleTimer = null;
  }
  queueLoading.value = false;
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

  if (version !== scheduleVersion) return;
  scheduleTimer = setTimeout(() => {
    void fetchSchedule(url, version);
  }, POLL_INTERVAL);
};

const applyChannel = (stationId: string, channel: Channel): void => {
  clearSchedule();

  activeStationId.value = stationId;
  streamName.value = channel.title;
  playerThumb.value =
    channel.features || String(runtimeConfig.public.placeholderStation);
  streamUrls.value = toSources(channel);
  streamUrl.value =
    streamUrls.value[0] || ({ src: "", type: "audio/mpeg" } as RadioSource);
  playlist.value = [];

  if (channel.schedule) {
    const version = scheduleVersion;
    void fetchSchedule(channel.schedule, version, true);
  }
};

const selectStation = (station: RadioStationOption): void => {
  const channel = catalog.value[station.id];
  if (!channel) return;
  applyChannel(station.id, channel);
};

const fetchData = async (): Promise<void> => {
  try {
    const data = await $fetch<Record<string, Channel>>(
      `/radio/${area.value || "asia"}/${slug.value || "viet-nam"}.json`,
    );
    if (!data) throw new Error("No data returned from fetch");

    catalog.value = data;
    const entries = Object.entries(data);
    stationCount.value = entries.length;
    stations.value = entries.map(([stationId, channel]) => ({
      id: stationId,
      title: channel.title,
      image:
        channel.features || String(runtimeConfig.public.placeholderStation),
      url: `/${area.value}/${slug.value}/${stationId}`,
    }));

    const favoriteEntry =
      entries.find(([, channel]) => channel.favorite) || entries[0];

    if (!favoriteEntry) {
      throw new Error("No station found");
    }

    applyChannel(favoriteEntry[0], favoriteEntry[1]);
  } catch (error) {
    console.error("Error fetching country radio data:", error);
  }
};

watch(
  () => [area.value, slug.value],
  () => {
    clearSchedule();
    void fetchData();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearSchedule();
});
</script>
