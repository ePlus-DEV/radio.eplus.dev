<template>
  <div
    class="flex flex-col p-5"
    v-if="playlist !== undefined && playlist.length > 0"
  >
    <div
      class="border-b dark:border-gray-600 pb-1 flex justify-between items-center mb-2"
    >
      <span
        class="text-base dark:text-white font-semibold uppercase text-gray-700"
      >
        {{ $t("panel.playlist") }}
      </span>
    </div>
    <div class="overflow-auto h-32">
      <div
        class="flex items-center border-b dark:border-gray-600 py-3 hover:shadow-md px-2 rounded"
        :class="index === 0 ? 'bg-gray-800 dark:bg-black' : ''"
        v-for="(item, index) in playlist"
        :key="index"
      >
        <img
          loading="lazy"
          class="w-10 h-10 object-cover rounded-lg"
          :alt="item.track_title + ' - ' + item.track_artist"
          :src="item.track_image !== '' ? item.track_image : thumb"
        />
        <div class="flex flex-col px-2 w-4/5">
          <span
            class="text-sm dark:text-white text-red-500 capitalize font-semibold pt-1 truncate"
          >
            {{ item.track_title }}
          </span>
          <span
            class="text-xs dark:text-white text-gray-500 uppercase font-medium truncate"
          >
            {{ item.track_artist }}
          </span>
        </div>
        <div class="w-1/5 text-right">
          <p class="text-xs text-grey-dark dark:text-white" v-if="index !== 0">
            {{ dayjs.unix(item.track_played).fromNow() }}
          </p>
          <div class="relative inline-flex" v-else>
            <img loading="lazy" src="/brand/favicon.ico" alt="Logo" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const dayjs = useDayjs();

interface PlaylistItem {
  track_title: string;
  track_artist: string;
  track_image: string;
  track_played: number;
}

defineProps<{
  playlist: PlaylistItem[];
  thumb: string;
}>();
</script>
