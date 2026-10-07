<template>
  <section
    v-if="song !== undefined && song.currentMedia !== undefined"
    class="border-t border-white/10 p-4 sm:p-6"
  >
    <div class="flex min-w-0 items-center gap-4 rounded-2xl bg-white/[0.05] p-3 ring-1 ring-inset ring-white/10">
      <img
        loading="lazy"
        :src="
          song.currentMedia.thumbnail !== undefined
            ? song.currentMedia.thumbnail
            : song.thumbnail
        "
        :alt="song.currentMedia.title"
        class="h-16 w-16 shrink-0 rounded-2xl object-cover"
      />

      <div class="min-w-0 flex-1">
        <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-300">
          Now playing
        </p>
        <p class="mt-1 truncate font-semibold text-slate-100">
          {{ song.currentMedia.title }}
        </p>
        <p class="mt-0.5 truncate text-sm text-slate-400">
          {{ song.currentMedia.artists }}
        </p>
      </div>
    </div>

    <div
      v-if="song.nextMedia?.title !== undefined"
      class="mt-3 flex min-w-0 items-center gap-3 px-2"
    >
      <img
        loading="lazy"
        class="h-10 w-10 shrink-0 rounded-xl object-cover"
        :src="
          song.nextMedia && song.nextMedia.thumbnail !== undefined
            ? song.nextMedia.thumbnail
            : song.thumbnail
        "
      />
      <div class="min-w-0">
        <p class="text-[11px] uppercase tracking-wide text-slate-500">
          {{ $t("panel.next") }}
        </p>
        <p class="truncate text-sm text-slate-300">
          {{ song.nextMedia?.title }} · {{ song.nextMedia?.artists }}
        </p>
      </div>
    </div>
  </section>
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
}
</script>
