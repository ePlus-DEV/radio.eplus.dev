<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs
      :area="Array.isArray(area) ? area[0] : area"
      level_1=""
      :level_2="$t(`world.${areaI18n}.name`)"
    />
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Player -->
    <Player
      country="world.asia.viet_nam"
      :home="true"
      thumb="/img/asia/flags/viet-nam.png"
      :streamName="streamName"
      :streamUrl="streamUrl"
    ></Player>
    <!-- END - Player -->

    {{ route.params }}

    <!-- BEGIN - PanelStation -->
    <PanelStation
      :area="Array.isArray(area) ? area[0] : area"
      :slug="Array.isArray(slug) ? slug[0] : slug"
      :i18n="i18n"
    />
    <!-- END - PanelStation -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { AudioSrc, AudioMimeType } from "vidstack";
const runtimeConfig = useRuntimeConfig();
const streamName = ref<string>("");
const route = useRoute();
const streamUrl = ref<AudioSrc>({ src: "", type: "audio/mpeg" });
const slug = ref(route.params.country);
const area = ref(route.params.area);
const areaI18n = (
  Array.isArray(area.value) ? area.value[0] : area.value
).replace(/-/g, "_");
const i18n = ref(
  `world.${String(area.value).replace(/-/g, "_")}.${String(slug.value).replace(/-/g, "_")}`,
);

useSeoMeta({
  // will be inferred as the lastmod value in the sitemap
  articleModifiedTime: new Date().toISOString(),
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
