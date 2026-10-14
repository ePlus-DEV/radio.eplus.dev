<template>
  <section :aria-label="$t('library.listening_stats')" class="space-y-6">
    <p class="text-sm leading-6 text-[var(--radio-text-muted)]">{{ $t('library.listening_stats_description') }}</p>
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="radio-surface p-5">
        <p class="text-xs font-medium text-[var(--radio-text-muted)]">{{ $t('library.listening_total') }}</p>
        <p class="mt-2 text-2xl font-bold tabular-nums">{{ formatDuration(duration.stats.totalMs) }}</p>
      </div>
      <div class="radio-surface p-5">
        <p class="text-xs font-medium text-[var(--radio-text-muted)]">{{ $t('library.listening_today') }}</p>
        <p class="mt-2 text-2xl font-bold tabular-nums">{{ formatDuration(duration.todayMs) }}</p>
      </div>
      <div class="radio-surface p-5">
        <p class="text-xs font-medium text-[var(--radio-text-muted)]">{{ $t('library.listening_stations') }}</p>
        <p class="mt-2 text-2xl font-bold tabular-nums">{{ stations.length }}</p>
      </div>
    </div>
    <div class="radio-surface p-4 sm:p-5">
      <h2 class="mb-4 text-lg font-semibold">{{ $t('library.listening_top_stations') }}</h2>
      <div v-if="stations.length" class="space-y-4">
        <div v-for="station in stations" :key="station.url" class="space-y-1.5">
          <div class="flex items-center justify-between gap-3 text-sm">
            <NuxtLink :to="station.url" :prefetch="false" class="min-w-0 truncate font-medium hover:text-rose-500">{{ station.title }}</NuxtLink>
            <span class="shrink-0 tabular-nums text-[var(--radio-text-muted)]">{{ formatDuration(station.ms) }}</span>
          </div>
          <div class="h-1.5 overflow-hidden rounded-full bg-[var(--radio-surface-soft)]" aria-hidden="true">
            <div class="h-full rounded-full bg-rose-500" :style="{ width: `${Math.min(100, Math.max(1, 100 * station.ms / maxStationMs))}%` }"></div>
          </div>
        </div>
      </div>
      <p v-else class="text-sm text-[var(--radio-text-muted)]">{{ $t('library.listening_empty') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useListeningDurationStore } from '~/stores/listeningDuration';

const duration = useListeningDurationStore();
const { t } = useI18n();
duration.hydrate();

const stations = computed(() => Object.entries(duration.stats.byStation)
  .map(([url, value]) => ({ url, title: value.title, ms: value.ms }))
  .filter(station => station.ms > 0)
  .sort((a, b) => b.ms - a.ms));
const maxStationMs = computed(() => stations.value[0]?.ms || 1);
const formatDuration = (value: number): string => {
  const seconds = Math.floor(value / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}${t('library.listening_hour_short')} ${minutes}${t('library.listening_minute_short')}`;
  if (minutes > 0) return `${minutes}${t('library.listening_minute_short')} ${seconds % 60}${t('library.listening_second_short')}`;
  return `${seconds}${t('library.listening_second_short')}`;
};
</script>
