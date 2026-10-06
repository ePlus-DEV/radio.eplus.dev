<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs
      :area="Array.isArray(area) ? area[0] : area"
      :level_1="i18n"
      :level_1_slug="Array.isArray(slug) ? slug[0] : slug"
    />
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Player -->
    <Player
      :country="i18n"
      :thumb="thumb"
      :streamName="streamName"
      :streamUrl="streamUrl"
      :playlist="playlist"
    ></Player>
    <!-- END - Player -->

    <!-- BEGIN - PanelStation -->
    <PanelStation />
    <!-- END - PanelStation -->
  </div>
</template>

<script setup lang="ts">
import type { AudioSrc, AudioMimeType } from "vidstack";
const $store = useMainStore();
const dayjs = useDayjs();
const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();
const streamName = ref<string>("");
const route = useRoute();
const streamUrl = ref<AudioSrc>({ src: "", type: "audio/mpeg" });
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
    const resData = await $fetch(url + dayjs().tz(timeZone.value).unix());

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

    interface Channel {
      favorite: boolean;
      title: string;
      stream: string;
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
    streamUrl.value = {
      src: favoriteChannel.cros
        ? `${runtimeConfig.public.corsServer}${favoriteChannel.stream}`
        : favoriteChannel.stream,
      type: favoriteChannel.type as AudioMimeType,
    };
    // Fetch the schedule data if available
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
