<template>
  <div class="space-y-6">
    <Breadcrumbs
      :area="area"
      :level_1="i18n"
      :level_1_slug="slug"
    />

    <section
      class="radio-surface relative overflow-hidden px-5 py-6 sm:px-7"
    >
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.10),transparent_42%)]"></div>
      <div class="relative flex items-center gap-4 sm:gap-5">
        <div class="flex h-20 w-24 shrink-0 items-center justify-center rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200/70 dark:bg-slate-950/50 dark:ring-white/10 sm:h-24 sm:w-28">
          <img
            :src="thumb"
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
      :thumb="thumb"
      :streamName="streamName"
      :streamUrl="streamUrl"
      :streamUrls="streamUrls"
      :playlist="playlist"
      :queue-expected="queueExpected"
    />

    <PanelStation />
  </div>
</template>



<script setup lang="ts">
import type { RadioSource } from "~/types/radio";
const $store = useMainStore();
const dayjs = useDayjs();
const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();
const streamName = ref<string>("");
const route = useRoute();
const streamUrl = ref<RadioSource>({ src: "", type: "audio/mpeg" });
const streamUrls = ref<RadioSource[]>([]);
const normalizeParam = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] || "" : value || "";
const slug = computed(() => normalizeParam(route.params.country));
const country = computed(() => slug.value.replace(/-/g, "_"));
const area = computed(() => normalizeParam(route.params.area));
const thumb = computed(
  () =>
    `/img/${area.value ? area.value : "asia"}/flags/${slug.value ? slug.value : "viet-nam"}.png`,
);
const timeZone = ref($store.getTimezone);
const i18n = computed(
  () => `world.${String(area.value).replace(/-/g, "_")}.${country.value}`,
);
const polling_schedule = ref<ReturnType<typeof setInterval> | null>(null);
const playlist = ref<Track[]>([]);
const stationCount = ref(0);
const queueExpected = ref(false);

const scheduleRequestUrl = (url: string): string =>
  /[?&](?:time|timestamp)=$/i.test(url)
    ? `${url}${dayjs().tz(timeZone.value).unix()}`
    : url;
interface Track {
  track_title: string;
  track_artist: string;
  track_image: string;
  track_played: number;
  schedule?: string;
}

const countryName = computed(() => t(i18n.value));
const seoTitle = computed(() => `Live Radio in ${countryName.value}`);
const seoDescription = computed(
  () =>
    `Listen to live internet radio stations from ${countryName.value}. Browse local stations and stream radio online on Radio ePlus.`,
);

useHead(() => ({
  title: seoTitle.value,
}));

useSeoMeta(() => ({
  description: seoDescription.value,
  ogTitle: seoTitle.value,
  ogDescription: seoDescription.value,
  twitterTitle: seoTitle.value,
  twitterDescription: seoDescription.value,
}));

/**
 * Fetches the schedule data from the given URL.
 * @param {string} url - The URL to fetch the schedule data from.
 */
const fetchSchedule = async (url: string) => {
  try {
    const resData = await $fetch(scheduleRequestUrl(url));

    const resDataSuccess = resData as { success: boolean };
    if (resDataSuccess.success) {
      playlist.value = (resData as { result: Track[] }).result;
    }
    if (polling_schedule.value !== null) {
      clearTimeout(polling_schedule.value);
    }
    polling_schedule.value = setInterval(() => {
      fetchSchedule(url);
    }, 60000);
  } catch (error) {
    console.error(error);
  }
};

/**
 * Fetches data from the server and initializes the player with the favorite channel.
 */
const fetchData = async (): Promise<void> => {
  try {
    const data = await $fetch<Record<string, Channel>>(
      `/radio/${area.value ? area.value : "asia"}/${slug.value ? slug.value : "viet-nam"}.json`,
    );

    if (!data) {
      throw new Error("No data returned from fetch");
    }

    stationCount.value = Object.keys(data).length;

    interface ChannelStream {
      url: string;
      type?: string;
      cros?: boolean;
    }

    interface Channel {
      favorite: boolean;
      title: string;
      stream: string;
      streams?: ChannelStream[];
      stream_alternative?: string;
      type: string;
      cros: boolean;
      schedule?: string;
    }

    const favoriteChannel = Object.values(data as Record<string, Channel>).find(
      (channel) => channel.favorite,
    );

    if (!favoriteChannel) {
      throw new Error("Favorite channel not found");
    }

    streamName.value = favoriteChannel.title;

    const seen = new Set<string>();
    const candidates = [
      {
        url: favoriteChannel.stream,
        type: favoriteChannel.type,
        cros: favoriteChannel.cros,
      },
      ...(favoriteChannel.streams || []),
      ...(favoriteChannel.stream_alternative
        ? [{ url: favoriteChannel.stream_alternative }]
        : []),
    ].filter((item) => {
      const url = String(item.url || "").trim();
      if (!/^https?:\/\//i.test(url) || seen.has(url)) return false;
      seen.add(url);
      return true;
    });

    streamUrls.value = candidates.map((item) => ({
      src: item.cros
        ? `${runtimeConfig.public.corsServer}${item.url}`
        : item.url,
      type: item.type,
    }));

    streamUrl.value =
      streamUrls.value[0] || ({ src: "", type: "audio/mpeg" } as RadioSource);
    // Fetch the schedule data if available
    queueExpected.value = Boolean(favoriteChannel.schedule);
    if (favoriteChannel.schedule !== undefined) {
      fetchSchedule(favoriteChannel.schedule);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

onMounted(() => {
  fetchData();
});

onBeforeUnmount(() => {
  clearInterval(polling_schedule.value as unknown as number);
});
</script>
