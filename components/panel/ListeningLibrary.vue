<template>
  <div class="space-y-7">
    <section v-for="group in groups" :key="group.key" :aria-label="$t(`library.${group.key}`)">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 class="flex items-center gap-2 text-lg font-semibold"><UIcon :name="group.icon" class="h-5 w-5 text-violet-500" />{{ $t(`library.${group.key}`) }}<span class="text-xs font-normal text-[var(--radio-text-muted)]">{{ group.items.length }}</span></h2>
        <NuxtLink v-if="compact && group.items.length" :to="`/library#${group.key}`" class="radio-interactive rounded-lg p-2 text-xs text-violet-500">{{ $t('redesign.see_all') }}</NuxtLink>
        <UButton v-if="!compact && group.key === 'recent' && group.items.length" color="neutral" variant="ghost" class="min-h-11" @click="listening.clearRecent()">{{ $t('library.clear_recent') }}</UButton>
      </div>
      <div v-if="group.items.length" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article v-for="station in compact ? group.items.slice(0, 4) : group.items" :key="station.url" class="radio-station-card relative min-w-0 rounded-2xl border p-2">
          <NuxtLink :to="station.url" class="radio-interactive flex min-h-16 min-w-0 items-center gap-3 rounded-xl pr-11" :title="station.title" @click="playSelected($event, station.url)">
            <StationArtwork :src="station.image" :alt="station.title" class="radio-library-artwork radio-themed-artwork h-12 w-12 shrink-0 rounded-xl object-contain p-1.5" />
            <span dir="auto" class="block min-w-0 truncate text-sm font-semibold">{{ station.title }}</span>
          </NuxtLink>
          <UButton color="neutral" variant="ghost" icon="i-lucide-heart" :class="isFavorite(station.url) ? 'text-rose-500' : ''" class="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 justify-center" :aria-pressed="isFavorite(station.url)" :aria-label="$t(isFavorite(station.url) ? 'library.remove_favorite' : 'library.add_favorite')" @click="listening.toggleFavorite(station)" />
        </article>
      </div>
      <p v-else class="rounded-2xl border border-dashed border-[var(--radio-border)] p-4 text-sm leading-6 text-[var(--radio-text-muted)]">{{ $t(`library.${group.key}_empty`) }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useListeningStore } from '~/stores/listening';
import { usePlaybackStore } from '~/stores/playback';
const props = defineProps<{ compact?: boolean; group?: string }>();
const listening = useListeningStore();
const playback = usePlaybackStore();
listening.hydrate();
const groups = computed(() => [
  { key: 'favorites', icon: 'i-lucide-heart', items: listening.library.favorites },
  { key: 'recent', icon: 'i-lucide-history', items: listening.library.recent },
].filter((group) => !props.group || props.group === 'all' || props.group === group.key));
const isFavorite = (url: string) => listening.library.favorites.some((item: { url: string }) => item.url === url);
const playSelected = (event: MouseEvent, url: string) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  // A deliberate library selection plays even when this is already the active station.
  playback.requestStation(url);
};
</script>
