<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs
      :area="area"
      level_1=""
      :level_2="$t(`world.${area.replace(/-/g, '_')}.name`)"
    />
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Player -->
    <Player
      ref="player"
      country="world.asia.viet_nam"
      :home="true"
      thumb="/img/asia/flags/viet-nam.png"
      :streamName="streamName"
      :streamUrl="streamUrl"
    ></Player>
    <!-- END - Player -->

    <!-- BEGIN - PanelRadio -->
    <!-- <PanelRadio :chooseTheArea="area.replace('-', '_')"></PanelRadio> -->
    <!-- BEGIN - PanelRadio -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRuntimeConfig } from "#app";
const route = useRoute();
const runtimeConfig = useRuntimeConfig();

const area = ref(route.params.area as string);
const streamName = ref<string>("");
import type { AudioSrc, AudioMimeType } from 'vidstack';

const streamUrl = ref<AudioSrc>({ src: "", type: "audio/mpeg" });

/**
 * Fetches data from the server and initializes the player with the favorite channel.
 */
const fetchData = async (): Promise<void> => {
  try {
    const response = await fetch(
      `/radio/asia/${runtimeConfig.public.pinChannelFavorites}.json`,
    );
    const data = await response.json();

    if (data) {
      interface Channel {
        favorite: boolean;
        title: string;
        stream: string;
        type: string;
        cros: boolean;
      }

      const favoriteChannel = Object.values(
        data as Record<string, Channel>,
      ).find((channel: Channel) => channel.favorite);
      if (favoriteChannel) {
        streamName.value = favoriteChannel.title;

        streamUrl.value = {
          src: favoriteChannel.cros
        ? runtimeConfig.app.CORS_SERVER_1 + favoriteChannel.stream
        : favoriteChannel.stream, type: favoriteChannel.type as AudioMimeType
        };
     
      //   if (
      //   playerState.type === "application/x-mpegURL" ||
      //   playerState.type === "audio/x-mpegurl"
      // ) {
      //   streamUrl.value = {
      //     src: favoriteChannel.stream
      //   };
      // }lse{
      //   streamUrl.value = {
      //     src: favoriteChannel.stream, type: favoriteChannel.type
      //   };

      } else {
        console.error("Favorite channel not found");
      }
    } else {
      console.error("No data returned from fetch");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

onMounted(() => {
  console.log("Component created/mounted");
  fetchData();
});
</script>
