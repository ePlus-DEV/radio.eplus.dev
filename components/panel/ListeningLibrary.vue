<template>
  <section class="radio-surface p-4 sm:p-5" :aria-label="$t('library.title')">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-lg font-semibold">{{ $t('library.title') }}</h2>
      <UButton v-if="listening.library.recent.length" color="neutral" variant="ghost" class="min-h-11" @click="listening.clearRecent()">{{ $t('library.clear_recent') }}</UButton>
    </div>
    <div class="grid gap-5 lg:grid-cols-2">
      <div v-for="group in groups" :key="group.key" class="min-w-0">
        <h3 class="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--radio-text-muted)]">
          <UIcon :name="group.icon" class="h-4 w-4" />{{ $t(`library.${group.key}`) }}
          <span class="text-xs tabular-nums">{{ group.items.length }}</span>
        </h3>
        <div v-if="group.items.length" class="radio-scrollbar max-h-72 overflow-y-auto overscroll-contain">
          <div v-for="station in group.items" :key="station.url" class="flex min-w-0 items-center gap-1 rounded-xl hover:bg-[var(--radio-hover)]">
            <NuxtLink :to="station.url" class="radio-interactive flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2" :title="station.title" @click="playSelected($event, station.url)">
              <img :src="station.image" :alt="station.title" width="44" height="44" loading="lazy" decoding="async" class="radio-themed-artwork h-11 w-11 shrink-0 rounded-lg object-contain p-1" />
              <span dir="auto" class="min-w-0 truncate text-sm font-medium">{{ station.title }}</span>
            </NuxtLink>
            <UButton color="neutral" variant="ghost" icon="i-lucide-heart" :class="isFavorite(station.url) ? 'text-rose-500' : ''" class="h-11 w-11 shrink-0 justify-center" :aria-pressed="isFavorite(station.url)" :aria-label="$t(isFavorite(station.url) ? 'library.remove_favorite' : 'library.add_favorite')" @click="listening.toggleFavorite(station)" />
          </div>
        </div>
        <p v-else class="rounded-xl bg-[var(--radio-surface-soft)] p-4 text-sm leading-6 text-[var(--radio-text-muted)]">{{ $t(`library.${group.key}_empty`) }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useListeningStore } from '~/stores/listening';
import { usePlaybackStore } from '~/stores/playback';
const listening = useListeningStore();
const playback = usePlaybackStore();
listening.hydrate();
const groups = computed(() => [
  { key: 'recent', icon: 'i-lucide-history', items: listening.library.recent },
  { key: 'favorites', icon: 'i-lucide-heart', items: listening.library.favorites },
]);
const isFavorite = (url: string) => listening.library.favorites.some((item: { url: string }) => item.url === url);
const playSelected = (event: MouseEvent, url: string) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  // A deliberate library selection plays even when this is already the active station.
  playback.requestStation(url);
};
</script>
