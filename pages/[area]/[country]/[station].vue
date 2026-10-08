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
        <div class="flex h-16 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-50 p-2 ring-1 ring-slate-200/70 dark:bg-slate-950/50 dark:ring-white/10 sm:h-20 sm:w-24">
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
          <h1 dir="auto" class="mt-2 line-clamp-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            {{ stationName }}
          </h1>
          <p
            v-if="stationMeta?.description"
            dir="auto"
            class="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400"
          >
            {{ stationMeta.description }}
          </p>
        </div>
      </div>
    </section>

    <Player
      :country="i18n"
      :country-name="countryName"
      :song="song"
      :program="program"
      :playlist="playlist"
      :streamName="streamName"
      :streamUrl="streamUrl"
      :streamUrls="streamUrls"
      :thumb="thumb"
      :stations="stations"
      :active-station-id="stationSlug"
      :queue-loading="queueLoading"
      @select-station="selectStation"
    />

    <PanelStation @update-data="handleDataFromChild" />

    <button
      v-show="slug === 'viet-nam'"
      type="button"
      class="fixed bottom-5 left-4 z-40 flex h-11 items-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
      @click="lyric_popup = !lyric_popup"
    >
      <fa :icon="['fas', 'list-music']" class="h-4 w-4" />
      <span class="hidden sm:inline">{{ $t("panel.lyric") }}</span>
    </button>

    <div
      v-if="lyric_popup"
      class="fixed inset-0 z-[80] flex items-end bg-slate-950/35 p-3 backdrop-blur-sm sm:items-auto sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
      @click.self="lyric_popup = false"
    >
      <aside
        class="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-white/10 dark:bg-slate-900 sm:fixed sm:bottom-20 sm:left-4 sm:max-w-md"
      >
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-500">
              Now playing
            </p>
            <h2 class="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
              {{ $t("panel.lyric") }}
            </h2>
          </div>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
            :aria-label="$t('button.close')"
            @click="lyric_popup = false"
          >
            <fa :icon="['fas', 'xmark']" />
          </button>
        </div>

        <div id="lyric" class="max-h-[55vh] overflow-y-auto px-5 py-4 sm:max-h-80">
          <p
            v-for="(line, index) in lyricLines"
            :key="`${index}-${line}`"
            class="py-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300"
          >
            {{ line }}
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>



<script setup lang="ts">
import type { RadioSource, RadioStationOption } from "~/types/radio";

interface ProgramItem {
  encodeId: string;
}

interface Track {
  track_title: string;
  track_artist: string;
  track_image: string;
  track_played: number;
}

interface CurrentMedia {
  title: string;
  artists: string;
  hasLyric: boolean;
  encodeId: string;
}

interface Song {
  encodeId: string;
  currentMedia?: CurrentMedia;
}

interface StationData {
  station_name: string;
  station_stream: string;
  station_streams?: StationStream[];
  station_image: string;
  station_schedule?: string;
  cros: boolean;
  type: string;
}

interface StationStream {
  url: string;
  type?: string;
  cros?: boolean;
  source?: string;
  label?: string;
}

interface StationCatalogEntry {
  title: string;
  description?: string;
  type: string;
  cros: boolean;
  stream: string;
  streams?: StationStream[];
  stream_alternative?: string;
  features?: string;
  schedule?: string;
}

const $store = useMainStore();
const dayjs = useDayjs();
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

const { data: stationCatalog } = await useAsyncData<
  Record<string, StationCatalogEntry>
>(
  `station-catalog:${area.value}:${slug.value}`,
  async () => {
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
      return JSON.parse(
        await readFile(file, "utf8"),
      ) as Record<string, StationCatalogEntry>;
    }

    return await $fetch<Record<string, StationCatalogEntry>>(
      stationCatalogUrl.value,
    );
  },
  {
    default: () => ({}),
  },
);
const stationMeta = computed(
  () => stationCatalog.value?.[stationSlug.value],
);

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
  () => `${siteUrl.value}/${area.value}/${slug.value}/${stationSlug.value}`,
);

const streamName = ref("");
const program = ref<ProgramItem[]>([]);
const song = ref<Song>();
const thumb = ref("");
const playlist = ref<Track[]>([]);
const queueLoading = ref(false);
const lyric_popup = ref(false);
const lyricLines = ref<string[]>([t("panel.updating")]);
const streamUrl = ref<RadioSource>({ src: "", type: "audio/mpeg" });
const streamUrls = ref<RadioSource[]>([]);

const toRadioSource = (
  stream: StationStream | { url: string; type?: string; cros?: boolean },
): RadioSource => ({
  src: stream.cros
    ? `${config.public.corsServer || ""}${stream.url}`
    : stream.url,
  type: (stream.type || "audio/mpeg"),
  source: stream.source,
  label: stream.label,
  proxied: Boolean(stream.cros),
});

const setStationStreams = (
  primary: StationStream,
  fallbacks: StationStream[] = [],
  alternative = "",
): void => {
  const seen = new Set<string>();
  const candidates: StationStream[] = [
    primary,
    ...fallbacks,
    ...(alternative
      ? [{ url: alternative, source: "legacy-alternative" }]
      : []),
  ].filter((item) => {
    const url = String(item?.url || "").trim();
    if (!/^https?:\/\//i.test(url) || seen.has(url)) return false;
    seen.add(url);
    return true;
  });

  streamUrls.value = candidates.map(toRadioSource);
  streamUrl.value =
    streamUrls.value[0] || ({ src: "", type: "audio/mpeg" });
};
let pollingSchedule: ReturnType<typeof setTimeout> | null = null;
let requestVersion = 0;
const POLL_INTERVAL = 60_000;

watch(
  stationMeta,
  (meta) => {
    if (!meta) return;
    streamName.value = meta.title;
    thumb.value = meta.features || String(config.public.placeholderStation);
    setStationStreams(
      { url: meta.stream, type: meta.type, cros: meta.cros, source: "primary" },
      meta.streams || [],
      meta.stream_alternative || "",
    );
  },
  { immediate: true },
);

useHead(() => ({
  title: seoTitle.value,
  script: [
    {
      key: "radio-station-schema",
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "RadioStation",
        name: stationName.value,
        description: seoDescription.value,
        url: canonicalUrl.value,
        image: seoImage.value,
      }),
    },
  ],
}));

useSeoMeta(() => ({
  description: seoDescription.value,
  ogTitle: seoTitle.value,
  ogDescription: seoDescription.value,
  ogImage: seoImage.value,
  twitterTitle: seoTitle.value,
  twitterDescription: seoDescription.value,
  twitterImage: seoImage.value,
}));

const clearPolling = (): void => {
  if (pollingSchedule) {
    clearTimeout(pollingSchedule);
    pollingSchedule = null;
  }
};

const currentTimestamp = (): number =>
  dayjs().tz($store.getTimezone).unix();

const scheduleRequestUrl = (url: string): string =>
  /[?&](?:time|timestamp)=$/i.test(url)
    ? `${url}${currentTimestamp()}`
    : url;

const fetchLyric = async (id: string, version: number): Promise<void> => {
  try {
    const resData = await $fetch(
      `${config.public.apiZingGetLyric}${id}&time=${currentTimestamp()}`,
    );
    if (version !== requestVersion) return;

    const value = resData as {
      err: number;
      data?: { sentences?: { words: { data: string }[] }[] };
    };

    if (value.err === 0 && value.data?.sentences?.length) {
      lyricLines.value = value.data.sentences.map((sentence) =>
        sentence.words.map((word) => word.data).join(" "),
      );
      return;
    }
  } catch (error) {
    console.error("Unable to load lyrics:", error);
  }

  if (version === requestVersion) lyricLines.value = [t("panel.no_lyric")];
};

const fetchDetail = async (url: string, version: number): Promise<void> => {
  try {
    const resData = await $fetch(scheduleRequestUrl(url));
    if (version !== requestVersion) return;

    const value = resData as { err: number; data?: Song };
    if (value.err !== 0 || !value.data) return;

    song.value = value.data;
    const currentMedia = value.data.currentMedia;
    if (!currentMedia) return;


    if (currentMedia.hasLyric) {
      await fetchLyric(currentMedia.encodeId, version);
    } else {
      lyricLines.value = [t("panel.no_lyric")];
    }
  } catch (error) {
    if (version === requestVersion) {
      console.error("Unable to load current song:", error);
    }
  }
};

const fetchSchedule = async (url: string, version: number): Promise<void> => {
  try {
    const resData = await $fetch(scheduleRequestUrl(url));
    if (version !== requestVersion) return;

    const value = resData as {
      err?: number;
      success?: boolean;
      data?: { items?: ProgramItem[] };
      result?: Track[];
    };

    if (value.err === 0 && slug.value === "viet-nam") {
      const items = value.data?.items || [];
      program.value = items;
      const firstProgram = items[0];
      if (firstProgram?.encodeId && config.public.apiZingLiveStreamProgramDetail) {
        await fetchDetail(
          `${config.public.apiZingLiveStreamProgramDetail}${firstProgram.encodeId}&time=`,
          version,
        );
      }
      return;
    }

    if (value.success && Array.isArray(value.result)) {
      playlist.value = value.result;
      const firstTrack = value.result[0];
      if (firstTrack) {
      }
    }
  } catch (error) {
    if (version === requestVersion) {
      console.error("Unable to load station schedule:", error);
    }
  } finally {
    if (version === requestVersion) {
      queueLoading.value = false;
    }
  }
};

const pollSchedule = async (url: string, version: number): Promise<void> => {
  await fetchSchedule(url, version);
  if (version !== requestVersion) return;

  pollingSchedule = setTimeout(() => {
    void pollSchedule(url, version);
  }, POLL_INTERVAL);
};

const handleDataFromChild = (data: StationData): void => {
  requestVersion += 1;
  const version = requestVersion;
  clearPolling();

  $store.setTimezone(area.value, slug.value);

  streamName.value = data.station_name;
  setStationStreams(
    { url: data.station_stream, type: data.type, cros: data.cros, source: "primary" },
    data.station_streams || [],
  );
  thumb.value = data.station_image;
  program.value = [];
  song.value = undefined;
  playlist.value = [];
  lyricLines.value = [t("panel.updating")];
  queueLoading.value = Boolean(data.station_schedule);
  if (data.station_schedule) {
    void pollSchedule(data.station_schedule, version);
  }
};

const selectStation = (station: RadioStationOption): void => {
  if (station.id === stationSlug.value) return;

  void navigateTo(
    station.url || `/${area.value}/${slug.value}/${station.id}`,
  );
};

onBeforeUnmount(() => {
  requestVersion += 1;
  clearPolling();
});
</script>
