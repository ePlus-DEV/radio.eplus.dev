<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs :area="area" level_1="" :level_2="$t(i18n)" />
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Player -->
    <Player
      country="world.asia.viet_nam"
      thumb="/img/asia/flags/viet-nam.png"
      :streamName="streamName"
      :streamUrl="streamUrl"
    ></Player>
    <!-- END - Player -->

    <!-- BEGIN - PanelRadio -->
    <PanelRadio :chooseTheArea="area.replace('-', '_')"></PanelRadio>
    <!-- BEGIN - PanelRadio -->
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();
const streamName = ref<string>("");
import type { AudioSrc, AudioMimeType } from "vidstack";
const streamUrl = ref<AudioSrc>({ src: "", type: "audio/mpeg" });

const route = useRoute();
const area = computed(() => String(route.params.area || ""));
const i18n = computed(() => `world.${area.value.replace(/-/g, "_")}.name`);
const areaName = computed(() => t(i18n.value));
const seoTitle = computed(() => `Live Radio in ${areaName.value}`);
const seoDescription = computed(
  () =>
    `Browse and listen to live internet radio stations across ${areaName.value} on Radio ePlus.`,
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
 * Fetches data from the server and initializes the player with the favorite channel.
 */
const fetchData = async (): Promise<void> => {
  try {
    const response = await fetch(
      `/radio/asia/${runtimeConfig.public.pinChannelFavorites}.json`,
    );
    const data = await response.json();

    if (!data) {
      throw new Error("No data returned from fetch");
    }

    interface Channel {
      favorite: boolean;
      title: string;
      stream: string;
      type: string;
      cros: boolean;
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
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

onMounted(() => {
  fetchData();
});
</script>
