<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <!-- <Breadcrumbs
      :area="area"
      level_1=""
      :level_2="$t(`world.${area.replace(/-/g, '_')}.name`)"
    /> -->
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Player -->
    <!-- <Player
      ref="player"
      country="world.asia.viet_nam"
      :home="true"
      thumb="/img/asia/flags/viet-nam.png"
    ></Player> -->
    <!-- END - Player -->

    <!-- BEGIN - PanelRadio -->
    <!-- <PanelRadio :chooseTheArea="area.replace('-', '_')"></PanelRadio> -->
    <!-- BEGIN - PanelRadio -->

    {{ stream_name }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRuntimeConfig, useAsyncData } from '#app';
const route = useRoute();
const runtimeConfig = useRuntimeConfig();

const area = ref(route.params.area as string);
const schedule_data = ref<any[]>([]);
const stream_name = ref<string | null>(null);

/**
 * Fetches data from the server and initializes the player with the favorite channel.
 */
const fetchData = async (): Promise<void> => {
  try {
    
    const response = await fetch(`/radio/asia/${runtimeConfig.public.pinChannelFavorites}.json`);
    const data = await response.json();

    if (data) {
      interface Channel {
        favorite: boolean;
        title: string;
        // Add other properties of the channel object if needed
      }
      
      const favoriteChannel = Object.values(data as Record<string, Channel>).find(
        (channel: Channel) => channel.favorite,
      );
      if (favoriteChannel) {
        stream_name.value = favoriteChannel.title;
      } else {
        console.error("Favorite channel not found");
      }

      // Vuex
      // store.dispatch("storePLAYERHOME", favoriteChannel);
      // (refs.player as any).init(true);
    } else {
      console.error("No data returned from fetch");
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};


onMounted(() => {
  console.log('Component created/mounted');
  fetchData();
});
</script>
