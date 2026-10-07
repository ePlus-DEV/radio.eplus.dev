<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs level_1="world.asia.viet_nam" />
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
    <PanelRadio></PanelRadio>
    <!-- BEGIN - PanelRadio -->
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();
const streamName = ref<string>("");
import type { RadioSource } from "~/types/radio";
const streamUrl = ref<RadioSource>({ src: "", type: "audio/mpeg" });

const seoTitle = "Live Internet Radio Worldwide";
const seoDescription =
  "Listen to live internet radio from around the world. Browse stations by region and country and stream radio online with Radio ePlus.";

useHead({
  title: seoTitle,
});

useSeoMeta({
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
});

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
      type: favoriteChannel.type,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

onMounted(() => {
  fetchData();
});
</script>
