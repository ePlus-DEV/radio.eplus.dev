<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs
      :area="Array.isArray(area) ? area[0] : area"
      :level_1="i18n"
      :level_1_slug="Array.isArray(slug) ? slug[0] : slug"
      :level_2="streamName"
    />
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Player -->
    <Player
      :country="i18n"
      :song="song"
      :program="program"
      :playlist="playlist"
      :streamName="streamName"
      :streamUrl="streamUrl"
      :streamUrls="streamUrls"
      :thumb="thumb"
    ></Player>
    <!-- END - Player -->

    <!-- BEGIN - Lyric -->
    <button
      class="fixed left-4 bottom-2 uppercase text-sm px-4 py-3 bg-gray-900 text-white rounded-full dark:bg-red-700 z-50"
      @click="lyric_popup = !lyric_popup"
      v-show="slug == 'viet-nam'"
    >
      <fa
        :icon="['far', 'list-music']"
        class="text-white fill-current h-5 w-5"
      />
    </button>
    <div
      class="fixed left-0 bottom-2 z-40"
      :class="lyric_popup ? '' : 'hidden'"
    >
      <div
        class="fixed sm:left-4 bottom-20 rounded-lg bg-white shadow-2xl w-full sm:w-1/2 xl:w-1/4 max-w-[450px] overflow-hidden dark:bg-gray-700 dark:text-white"
      >
        <!-- Text -->
        <div class="">
          <div class="relative overflow-hidden px-8 pt-8">
            <div
              width="80"
              height="77"
              class="absolute -top-10 -right-10 text-yellow-500"
            >
              <svg
                width="120"
                height="119"
                viewBox="0 0 120 119"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  opacity="0.3"
                  d="M6.38128 49.1539C3.20326 32.893 13.809 17.1346 30.0699 13.9566L70.3846 6.07751C86.6455 2.89948 102.404 13.5052 105.582 29.7661L113.461 70.0808C116.639 86.3417 106.033 102.1 89.7724 105.278L49.4577 113.157C33.1968 116.335 17.4384 105.729 14.2604 89.4686L6.38128 49.1539Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div class="text-2xl flex flex-col pb-4">
              <small id="song"></small>
              <span class="text-3xl font-bold"> {{ $t("panel.lyric") }} </span>
            </div>
            <div class="pb-4 overflow-y-auto h-64" id="lyric">
              <p
                v-for="(line, index) in lyricLines"
                :key="`${index}-${line}`"
                class="pb-1"
              >
                {{ line }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- END - Lyric -->

    <!-- BEGIN - PanelStation -->
    <PanelStation @updateData="handleDataFromChild" />
    <!-- END - PanelStation -->
  </div>
</template>

<script setup lang="ts">
import type { RadioSource } from "~/types/radio";

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
});

const setStationStreams = (
  primary: { url: string; type?: string; cros?: boolean },
  fallbacks: StationStream[] = [],
): void => {
  const seen = new Set<string>();
  const candidates = [primary, ...fallbacks].filter((item) => {
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
      { url: meta.stream, type: meta.type, cros: meta.cros },
      meta.streams || [],
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
    const resData = await $fetch(`${url}${currentTimestamp()}`);
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
    const resData = await $fetch(`${url}${currentTimestamp()}`);
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
    { url: data.station_stream, type: data.type, cros: data.cros },
    data.station_streams || [],
  );
  thumb.value = data.station_image;
  program.value = [];
  song.value = undefined;
  playlist.value = [];
  lyricLines.value = [t("panel.updating")];
  if (data.station_schedule) {
    void pollSchedule(data.station_schedule, version);
  }
};

onBeforeUnmount(() => {
  requestVersion += 1;
  clearPolling();
});
</script>
