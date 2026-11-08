<template>
  <section v-if="station" class="radio-resume-card flex items-center gap-3 rounded-2xl border border-[var(--radio-border)] p-4 sm:gap-5 sm:p-5" :aria-label="$t('redesign.continue_listening')">
    <div class="min-w-0 flex-1">
      <h2 class="mb-3 text-xs font-semibold text-[var(--radio-text-muted)]">{{ $t('redesign.continue_listening') }}</h2>
      <div class="flex min-w-0 items-center gap-3 sm:gap-5">
        <StationArtwork :src="station.image" :alt="station.title" class="radio-themed-artwork h-16 w-16 shrink-0 rounded-xl object-contain sm:h-20 sm:w-20" />
        <div class="min-w-0">
          <p dir="auto" class="truncate text-base font-semibold sm:text-xl">{{ station.title }}</p>
          <p class="mt-1 truncate text-xs text-[var(--radio-text-muted)]">{{ $t(station.countryKey) }}</p>
          <span class="mt-2 inline-block rounded-full px-2.5 py-1 text-[10px]" :class="playback.status === 'connecting' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : playback.status === 'playing' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-[var(--radio-surface-soft)] text-[var(--radio-text-muted)]'">{{ $t(playback.status === 'connecting' ? 'player.connecting' : playback.status === 'playing' ? 'player.on_air' : 'redesign.paused') }}</span>
        </div>
      </div>
    </div>
    <UButton :icon="playback.status === 'connecting' ? 'i-lucide-loader-circle' : playback.status === 'playing' ? 'i-lucide-pause' : 'i-lucide-play'" class="h-14 w-14 shrink-0 justify-center rounded-full bg-rose-500 text-white hover:bg-rose-400" :class="playback.status === 'connecting' ? '[&_.iconify]:animate-spin' : ''" :aria-label="$t(playback.status === 'connecting' ? 'player.stop_connecting' : playback.status === 'playing' ? 'player.pause' : 'redesign.continue_listening')" @click="toggle" />
  </section>
</template>
<script setup lang="ts">
import { useListeningStore } from '~/stores/listening';
import { usePlaybackStore } from '~/stores/playback';
const playback = usePlaybackStore();
const listening = useListeningStore();
listening.hydrate();
const station = computed(() => listening.library.lastStation ? (playback.station || listening.library.lastStation) : null);
const toggle = () => {
  if (playback.playing || playback.waiting) playback.pauseRequest += 1;
  else if (station.value) {
    playback.requestStation(station.value.url);
    if (playback.station?.url !== station.value.url) void navigateTo(station.value.url);
  }
};
</script>
