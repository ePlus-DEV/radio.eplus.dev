<template>
  <!-- BEGIN - Zing - Only -->
  <div
    class="flex flex-col items-center p-5 border-b dark:border-gray-600"
    v-if="song !== undefined && song.currentMedia !== undefined"
  >
    <figure
      class="shadow-lg rounded-xl flex-none w-auto md:w-xl"
      style="transform: rotate(1deg) translateZ(0px)"
    >
      <figcaption
        class="flex items-center space-x-4 p-6 md:px-10 md:py-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-t-xl leading-6 font-semibold text-white"
      >
        <div
          class="flex-none w-20 h-20 bg-white rounded-full flex items-center justify-center"
        >
          <img
            loading="lazy"
            :src="
              song.currentMedia.thumbnail !== undefined
                ? song.currentMedia.thumbnail
                : song.thumbnail
            "
            :alt="song.currentMedia.title"
            class="w-20 h-20 rounded-full bg-orange-100"
          />
        </div>
        <div class="flex-auto">
          {{ song.currentMedia.title }}<br /><span class="text-orange-100">
            {{ song.currentMedia.artists }}
          </span>
        </div>
      </figcaption>
    </figure>

    <figure
      class="md:flex bg-slate-100 rounded-xl p-8 md:p-0 dark:bg-slate-800"
      v-if="song.nextMedia?.title !== undefined"
    >
      <img
        loading="lazy"
        class="w-16 h-16 md:w-20 md:h-20 md:rounded-none rounded-full mx-auto"
        :src="
          song.nextMedia && song.nextMedia.thumbnail !== undefined
            ? song.nextMedia.thumbnail
            : song.thumbnail
        "
      />
      <div class="md:p-2 text-center md:text-left space-y-4">
        <figcaption class="font-medium">
          <div class="text-sky-500 dark:text-white">
            {{ $t("panel.next") }}: {{ song.nextMedia?.title }}
          </div>
          <div class="text-slate-700 dark:text-white">
            {{ song.nextMedia?.artists }}
          </div>
        </figcaption>
      </div>
    </figure>
  </div>
  <!-- END - Zing - Only -->
</template>
<script setup lang="ts">
defineProps<{
  song?: Song;
}>();

interface CurrentMedia {
  title: string;
  artists: string;
  hasLyric: boolean;
  encodeId: string;
  thumbnail?: string;
}

interface Song {
  encodeId: string;
  currentMedia?: CurrentMedia;
  nextMedia?: CurrentMedia;
  thumbnail?: string;
  // Add other properties as needed
}
</script>
