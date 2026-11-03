<template>
  <section :aria-label="$t('library.listening_stats')" class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div class="max-w-2xl">
        <p class="text-sm leading-6 text-[var(--radio-text-muted)]">{{ $t('online_stats.compare_intro') }}</p>
      </div>
      <NuxtLink to="/settings" class="radio-interactive inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] px-3 text-xs font-semibold text-[var(--radio-text-muted)] transition hover:text-[var(--radio-text)]">
        <UIcon name="i-lucide-settings-2" class="h-4 w-4" />
        {{ $t('online_stats.manage_settings') }}
      </NuxtLink>
    </header>

    <!-- Two genuinely different measurements; no stacked or additive total. -->
    <div class="grid gap-4 lg:grid-cols-2">
      <article class="radio-surface relative min-w-0 overflow-hidden rounded-3xl border border-[var(--radio-border)] p-5 sm:p-6" :aria-label="$t('online_stats.listening')">
        <div class="absolute inset-x-0 top-0 h-1 bg-rose-500" aria-hidden="true"></div>
        <div class="flex items-center justify-between gap-2">
          <div class="flex min-w-0 items-center gap-2.5">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <UIcon name="i-lucide-headphones" class="h-5 w-5" />
            </span>
            <h2 class="min-w-0 text-base font-bold">{{ $t('online_stats.listening') }}</h2>
          </div>
          <span v-if="isLive" class="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-300">
            <span class="h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden="true"></span>
            {{ $t('library.listening_live') }}
          </span>
        </div>
        <p class="mt-5 text-xs font-medium text-[var(--radio-text-muted)]">{{ $t('library.listening_total') }}</p>
        <p class="mt-1 text-3xl font-bold tracking-tight tabular-nums text-[var(--radio-text)] sm:text-4xl">{{ formatDuration(totalListeningMs) }}</p>
        <div class="mt-4 flex items-center justify-between gap-3 rounded-xl bg-rose-500/10 px-3 py-2.5">
          <span class="text-xs font-medium text-[var(--radio-text-muted)]">{{ $t('online_stats.listening_today') }}</span>
          <strong class="shrink-0 text-base font-bold tabular-nums text-rose-600 dark:text-rose-300">{{ formatDuration(todayListeningMs) }}</strong>
        </div>
        <p class="mt-3 min-h-10 text-xs leading-5 text-[var(--radio-text-muted)]">{{ $t('online_stats.listening_explanation') }}</p>
        <div class="mt-3 flex justify-end border-t border-[var(--radio-border)] pt-2">
          <button type="button" role="switch" :aria-checked="duration.enabled" :aria-label="$t('library.listening_tracking_title')"
            class="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-xs font-medium text-[var(--radio-text-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
            @click="duration.setTrackingEnabled(!duration.enabled)">
            {{ $t('library.listening_tracking_title') }}
            <span class="relative h-5 w-9 shrink-0 rounded-full transition-colors" :class="duration.enabled ? 'bg-rose-500' : 'bg-[var(--radio-border)]'" aria-hidden="true">
              <span class="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" :class="duration.enabled ? 'translate-x-4' : ''"></span>
            </span>
          </button>
        </div>
      </article>

      <article class="radio-surface relative min-w-0 overflow-hidden rounded-3xl border border-[var(--radio-border)] p-5 sm:p-6" :aria-label="$t('online_stats.online')">
        <div class="absolute inset-x-0 top-0 h-1 bg-emerald-500" aria-hidden="true"></div>
        <div class="flex items-center gap-2.5">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <UIcon name="i-lucide-monitor-dot" class="h-5 w-5" />
          </span>
          <h2 class="min-w-0 text-base font-bold">{{ $t('online_stats.online') }}</h2>
        </div>
        <p class="mt-5 text-xs font-medium text-[var(--radio-text-muted)]">{{ $t('online_stats.total') }}</p>
        <p class="mt-1 text-3xl font-bold tracking-tight tabular-nums text-[var(--radio-text)] sm:text-4xl">{{ formatDuration(totalOnlineMs) }}</p>
        <div class="mt-4 flex items-center justify-between gap-3 rounded-xl bg-emerald-500/10 px-3 py-2.5">
          <span class="text-xs font-medium text-[var(--radio-text-muted)]">{{ $t('online_stats.today') }}</span>
          <strong class="shrink-0 text-base font-bold tabular-nums text-emerald-700 dark:text-emerald-300">{{ formatDuration(todayOnlineMs) }}</strong>
        </div>
        <p class="mt-3 min-h-10 text-xs leading-5 text-[var(--radio-text-muted)]">{{ $t('online_stats.online_explanation') }}</p>
        <div class="mt-3 flex justify-end border-t border-[var(--radio-border)] pt-2">
          <button type="button" role="switch" :aria-checked="online.enabled" :aria-label="$t('online_stats.tracking')"
            class="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-xs font-medium text-[var(--radio-text-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
            @click="online.setTrackingEnabled(!online.enabled)">
            {{ $t('online_stats.tracking') }}
            <span class="relative h-5 w-9 shrink-0 rounded-full transition-colors" :class="online.enabled ? 'bg-emerald-500' : 'bg-[var(--radio-border)]'" aria-hidden="true">
              <span class="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" :class="online.enabled ? 'translate-x-4' : ''"></span>
            </span>
          </button>
        </div>
      </article>
    </div>
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="text-xs leading-5 text-[var(--radio-text-muted)]">{{ $t('online_stats.new_counter_note') }}</p>
      <UButton color="neutral" variant="ghost" icon="i-lucide-trash-2" size="sm" class="min-h-10" @click="clearStatsOpen = true">
        {{ $t('online_stats.clear_action') }}
      </UButton>
    </div>

    <figure class="radio-surface space-y-4 p-4 sm:p-5"  :aria-label="$t(chartMode === 'listening' ? 'library.listening_daily_chart' : 'online_stats.daily_chart')">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold">{{ $t(chartMode === 'listening' ? 'library.listening_daily_chart' : 'online_stats.daily_chart') }}</h2>
          <p class="mt-1 text-xs text-[var(--radio-text-muted)]">{{ $t(chartMode === 'listening' ? 'library.listening_daily_hint' : 'online_stats.daily_hint') }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex gap-1 rounded-xl bg-[var(--radio-surface-soft)] p-1" role="group" :aria-label="$t('online_stats.chart_kind')">
            <button v-for="mode in chartModes" :key="mode" type="button"
              class="min-h-9 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
               :class="chartMode === mode ? (mode === 'online' ? 'bg-[var(--radio-surface)] text-emerald-700 shadow-sm dark:text-emerald-300' : 'bg-[var(--radio-surface)] text-rose-600 shadow-sm dark:text-rose-300') : 'text-[var(--radio-text-muted)]'"
              :aria-pressed="chartMode === mode" @click="chartMode = mode">
              {{ $t(mode === 'listening' ? 'online_stats.listening' : 'online_stats.online') }}
            </button>
          </div>
        <div class="flex flex-wrap gap-1 rounded-xl bg-[var(--radio-surface-soft)] p-1" role="group" :aria-label="$t('library.listening_chart_range')">
          <button
            v-for="days in [7, 30, 90]"
            :key="days"
            type="button"
            class="min-h-9 rounded-lg px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
            :class="rangeDays === days ? 'bg-[var(--radio-surface)] text-rose-600 shadow-sm dark:text-rose-300' : 'text-[var(--radio-text-muted)] hover:text-[var(--radio-text)]'"
            :aria-pressed="rangeDays === days"
            @click="rangeDays = days"
          >{{ $t(`library.listening_last_${days}`) }}</button>
        </div>
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span class="text-[var(--radio-text-muted)]">{{ $t(chartMode === 'listening' ? 'library.listening_period_total' : 'online_stats.period_total') }}</span>
        <span class="font-bold tabular-nums">{{ formatDuration(periodTotalMs) }}</span>
      </div>
      <div ref="chartScroll" class="radio-scrollbar overflow-x-auto pb-2">
        <div
          class="flex h-48 w-full items-stretch gap-1 border-b border-[var(--radio-border)] pt-4"
          :style="{ minWidth: rangeDays === 90 ? '1440px' : rangeDays === 30 ? '720px' : '0' }"
        >
          <div v-for="(day, index) in chartItems" :key="day.key" class="flex min-w-0 flex-1 flex-col items-center">
            <button
              type="button"
              class="group relative flex min-h-0 w-full flex-1 items-end justify-center rounded-t focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
              :aria-label="formatDay(day.key) + ': ' + formatDuration(day.ms)"
              :aria-pressed="selectedDay.key === day.key"
              :title="formatDay(day.key) + ' · ' + formatDuration(day.ms)"
              @click="selectedDayKey = day.key"
            >
              <span
                class="block w-full max-w-12 rounded-t-sm transition-[height,background-color] duration-200"
                 :class="chartMode === 'online' ? (selectedDay.key === day.key ? 'bg-emerald-500' : day.ms > 0 ? 'bg-emerald-400/70 group-hover:bg-emerald-400' : 'bg-[var(--radio-border)]') : (selectedDay.key === day.key ? 'bg-rose-500' : day.ms > 0 ? 'bg-rose-300 group-hover:bg-rose-400 dark:bg-rose-500/60' : 'bg-[var(--radio-border)]')"
                :style="{ height: barHeight(day.ms) }"
                aria-hidden="true"
              ></span>
            </button>
            <span class="mt-2 h-4 text-[10px] tabular-nums text-[var(--radio-text-muted)]" aria-hidden="true">
              {{ showDayLabel(index) ? formatTick(day.key) : '' }}
            </span>
          </div>
        </div>
      </div>
      <figcaption class="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--radio-surface-soft)] px-3 py-2 text-sm">
        <span class="text-[var(--radio-text-muted)]">{{ formatDay(selectedDay.key) }}</span>
        <span class="font-semibold tabular-nums">{{ formatDuration(selectedDay.ms) }}</span>
      </figcaption>
      <p v-if="!hasDailyListening" class="text-xs text-[var(--radio-text-muted)]">{{ $t(chartMode === 'listening' ? 'library.listening_daily_empty' : 'online_stats.daily_empty') }}</p>
    </figure>
    <div class="radio-surface p-4 sm:p-5">
      <h2 class="mb-4 text-lg font-semibold">{{ $t('library.listening_top_stations') }} <span class="text-sm font-normal text-[var(--radio-text-muted)]">({{ stations.length }})</span></h2>
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
    <UModal
      v-model:open="clearStatsOpen"
      :title="$t('online_stats.clear_title')"
      :description="$t('online_stats.clear_description')"
      :ui="{ content: 'max-w-md' }"
    >
      <template #footer>
        <div class="flex w-full flex-wrap justify-end gap-2">
          <UButton color="neutral" variant="outline" class="min-h-11" @click="clearStatsOpen = false">
            {{ $t('library.listening_confirm_delete_no') }}
          </UButton>
          <UButton color="error" class="min-h-11" @click="confirmDeleteStatistics">
            {{ $t('library.listening_confirm_delete_yes') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { useListeningDurationStore } from '~/stores/listeningDuration';
import { useOnlineDurationStore } from '~/stores/onlineDuration';
import { dailyOnlineSeries } from '~/utils/online-duration.mjs';
import { usePlaybackStore } from '~/stores/playback';
import { dailyListeningSeries, localDayKey } from '~/utils/listening-duration.mjs';

const duration = useListeningDurationStore();
const online = useOnlineDurationStore();
const playback = usePlaybackStore();
const { t, locale } = useI18n();
duration.hydrate();
online.hydrate();
const clearStatsOpen = ref(false);
const confirmDeleteStatistics = () => {
  duration.clearStatistics();
  online.clearStatistics();
  clearStatsOpen.value = false;
};
const rangeDays = ref(7);
const chartMode = ref<'listening' | 'online'>('listening');
const chartModes = ['listening', 'online'] as const;
const chartScroll = ref<HTMLElement | null>(null);
watch([rangeDays, chartMode], async () => {
  // Show the newest days first when switching to wide 30/90-day charts.
  await nextTick();
  if (chartScroll.value) chartScroll.value.scrollLeft = chartScroll.value.scrollWidth;
});
const selectedDayKey = ref('');
const chartItems = computed(() => chartMode.value === 'listening'
  ? dailyListeningSeries(duration.stats, rangeDays.value, new Date(), duration.liveMs)
  : dailyOnlineSeries(online.stats, rangeDays.value, new Date(), online.liveMs));
const periodTotalMs = computed(() => chartItems.value.reduce((sum, day) => sum + day.ms, 0));
const peakMs = computed(() => Math.max(1, ...chartItems.value.map(day => day.ms)));
const hasDailyListening = computed(() => chartItems.value.some(day => day.ms > 0));
const selectedDay = computed(() => chartItems.value.find(day => day.key === selectedDayKey.value)
  || chartItems.value[chartItems.value.length - 1]
  || { key: localDayKey(), ms: 0 });
const barHeight = (ms: number): string => ms > 0 ? `${Math.max(3, Math.round(ms / peakMs.value * 100))}%` : '2px';
const showDayLabel = (index: number): boolean => rangeDays.value === 7
  || index === 0 || index === chartItems.value.length - 1
  || index % (rangeDays.value === 30 ? 5 : 15) === 0;
const parseDay = (dayKey: string) => {
  const [year, month, day] = dayKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};
// Reuse Intl formatters: the live chart can redraw 90 bars every second.
const dayFormatter = computed(() => new Intl.DateTimeFormat(locale.value, {
  day: '2-digit', month: 'short', year: 'numeric',
}));
const tickFormatter = computed(() => new Intl.DateTimeFormat(locale.value, {
  day: '2-digit', month: '2-digit',
}));
const formatDay = (dayKey: string) => dayFormatter.value.format(parseDay(dayKey));
const formatTick = (dayKey: string) => tickFormatter.value.format(parseDay(dayKey));


const isLive = computed(() => duration.activeStationUrl !== '');
const totalListeningMs = computed(() => duration.stats.totalMs + duration.liveMs);
const totalOnlineMs = computed(() => online.stats.totalMs + online.liveMs);
const todayOnlineMs = computed(() => dailyOnlineSeries(online.stats, 7, new Date(), online.liveMs).at(-1)?.ms || 0);
// Use the same midnight-aware daily buckets as the chart, including live seconds.
const todayListeningMs = computed(() => dailyListeningSeries(
  duration.stats, 7, new Date(), duration.liveMs,
).at(-1)?.ms || 0);
const stations = computed(() => {
  const entries = Object.entries(duration.stats.byStation)
    .map(([url, value]) => ({ url, title: value.title, ms: value.ms }));
  const liveUrl = duration.activeStationUrl;
  if (liveUrl && duration.liveMs > 0) {
    const existing = entries.find(entry => entry.url === liveUrl);
    if (existing) existing.ms += duration.liveMs;
    else if (playback.station?.url === liveUrl) {
      entries.push({ url: liveUrl, title: playback.station.title, ms: duration.liveMs });
    }
  }
  return entries.filter(station => station.ms > 0).sort((a, b) => b.ms - a.ms);
});
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
