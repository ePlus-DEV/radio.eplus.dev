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

    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-sm font-semibold">{{ $t('online_stats.daily_compare') }}</h2>
      <div class="inline-flex max-w-full flex-wrap gap-1 rounded-xl bg-[var(--radio-surface-soft)] p-1" role="group" :aria-label="$t('library.listening_chart_range')">
        <button v-for="days in [7, 30, 90]" :key="days" type="button"
          class="min-h-9 rounded-lg px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
          :class="rangeDays === days ? 'bg-[var(--radio-surface)] text-[var(--radio-text)] shadow-sm' : 'text-[var(--radio-text-muted)] hover:text-[var(--radio-text)]'"
          :aria-pressed="rangeDays === days" @click="rangeDays = days">
          {{ $t('library.listening_last_' + days) }}
        </button>
      </div>
    </div>

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
        <figure class="mt-4 rounded-2xl bg-[var(--radio-surface-soft)] px-3 py-3" :aria-label="$t('online_stats.listening_trend')">
          <figcaption class="flex items-center justify-between gap-2 text-xs">
            <span class="font-medium text-[var(--radio-text-muted)]">{{ $t('library.listening_period_total') }}</span>
            <strong class="tabular-nums text-[var(--radio-text)]">{{ formatDuration(listeningPeriodTotal) }}</strong>
          </figcaption>
          <svg v-if="listeningGeometry.hasData" class="mt-2 block h-24 w-full" viewBox="0 0 320 96" preserveAspectRatio="none" role="img" :aria-label="$t('online_stats.listening_trend')">
            <defs>
              <linearGradient id="listening-trend-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.22" />
                <stop offset="100%" stop-color="#f43f5e" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path d="M5 88 H315" fill="none" stroke="var(--radio-border)" stroke-width="1" />
            <path :d="listeningGeometry.areaPath" fill="url(#listening-trend-fill)" />
            <path :d="listeningGeometry.linePath" fill="none" stroke="#f43f5e" stroke-width="2.75" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
            <circle v-if="listeningGeometry.points[selectedDayIndex]" :cx="listeningGeometry.points[selectedDayIndex].x" :cy="listeningGeometry.points[selectedDayIndex].y" r="4.5" fill="#f43f5e" stroke="var(--radio-surface)" stroke-width="2" vector-effect="non-scaling-stroke" />
          </svg>
          <p v-else class="flex h-24 items-center justify-center text-xs text-[var(--radio-text-muted)]">{{ $t('library.listening_daily_empty') }}</p>
          <div class="flex justify-between gap-2 text-[10px] text-[var(--radio-text-muted)]">
            <span>{{ formatTick(listeningTrend[0]?.key) }}</span>
            <span>{{ formatTick(listeningTrend.at(-1)?.key) }}</span>
          </div>
        </figure>
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
        <figure class="mt-4 rounded-2xl bg-[var(--radio-surface-soft)] px-3 py-3" :aria-label="$t('online_stats.online_trend')">
          <figcaption class="flex items-center justify-between gap-2 text-xs">
            <span class="font-medium text-[var(--radio-text-muted)]">{{ $t('online_stats.period_total') }}</span>
            <strong class="tabular-nums text-[var(--radio-text)]">{{ formatDuration(onlinePeriodTotal) }}</strong>
          </figcaption>
          <svg v-if="onlineGeometry.hasData" class="mt-2 block h-24 w-full" viewBox="0 0 320 96" preserveAspectRatio="none" role="img" :aria-label="$t('online_stats.online_trend')">
            <defs>
              <linearGradient id="online-trend-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#10b981" stop-opacity="0.22" />
                <stop offset="100%" stop-color="#10b981" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path d="M5 88 H315" fill="none" stroke="var(--radio-border)" stroke-width="1" />
            <path :d="onlineGeometry.areaPath" fill="url(#online-trend-fill)" />
            <path :d="onlineGeometry.linePath" fill="none" stroke="#10b981" stroke-width="2.75" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
            <circle v-if="onlineGeometry.points[selectedDayIndex]" :cx="onlineGeometry.points[selectedDayIndex].x" :cy="onlineGeometry.points[selectedDayIndex].y" r="4.5" fill="#10b981" stroke="var(--radio-surface)" stroke-width="2" vector-effect="non-scaling-stroke" />
          </svg>
          <p v-else class="flex h-24 items-center justify-center text-xs text-[var(--radio-text-muted)]">{{ $t('online_stats.daily_empty') }}</p>
          <div class="flex justify-between gap-2 text-[10px] text-[var(--radio-text-muted)]">
            <span>{{ formatTick(onlineTrend[0]?.key) }}</span>
            <span>{{ formatTick(onlineTrend.at(-1)?.key) }}</span>
          </div>
        </figure>
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

    <div class="radio-surface rounded-2xl p-4 sm:p-5">
      <div class="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span class="font-semibold">{{ $t('online_stats.selected_day') }}</span>
        <span class="font-medium tabular-nums">{{ formatDay(selectedDateKey) }}</span>
      </div>
      <input type="range" min="0" :max="Math.max(0, listeningTrend.length - 1)" step="1"
        :value="selectedDayIndex" @input="selectDayAtIndex"
        class="mt-3 h-2 w-full cursor-pointer accent-rose-500"
        :aria-label="$t('online_stats.select_day')" />
      <div class="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
        <span class="inline-flex items-center gap-2 text-[var(--radio-text-muted)]">
          <span class="h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden="true"></span>
          {{ $t('online_stats.listening') }}:
          <strong class="tabular-nums text-[var(--radio-text)]">{{ formatDuration(selectedListeningMs) }}</strong>
        </span>
        <span class="inline-flex items-center gap-2 text-[var(--radio-text-muted)]">
          <span class="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
          {{ $t('online_stats.online') }}:
          <strong class="tabular-nums text-[var(--radio-text)]">{{ formatDuration(selectedOnlineMs) }}</strong>
        </span>
      </div>
      <p class="mt-2 text-[11px] leading-5 text-[var(--radio-text-muted)]">{{ $t('online_stats.independent_scales') }}</p>
    </div>
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
import { buildActivityTrend } from '~/utils/activity-trend.mjs';

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
const selectedDayKey = ref('');
const listeningTrend = computed(() => dailyListeningSeries(duration.stats, rangeDays.value, new Date(), duration.liveMs));
const onlineTrend = computed(() => dailyOnlineSeries(online.stats, rangeDays.value, new Date(), online.liveMs));
const listeningGeometry = computed(() => buildActivityTrend(listeningTrend.value));
const onlineGeometry = computed(() => buildActivityTrend(onlineTrend.value));
const listeningPeriodTotal = computed(() => listeningTrend.value.reduce((sum, day) => sum + day.ms, 0));
const onlinePeriodTotal = computed(() => onlineTrend.value.reduce((sum, day) => sum + day.ms, 0));
const selectedDayIndex = computed(() => {
  const index = listeningTrend.value.findIndex(item => item.key === selectedDayKey.value);
  return index >= 0 ? index : Math.max(0, listeningTrend.value.length - 1);
});
const selectedDateKey = computed(() => listeningTrend.value[selectedDayIndex.value]?.key || localDayKey());
const selectedListeningMs = computed(() => listeningTrend.value[selectedDayIndex.value]?.ms || 0);
const selectedOnlineMs = computed(() => onlineTrend.value[selectedDayIndex.value]?.ms || 0);
const selectDayAtIndex = (event: Event) => {
  const raw = Number((event.target as HTMLInputElement).value);
  if (!Number.isInteger(raw) || raw < 0 || raw >= listeningTrend.value.length) return;
  selectedDayKey.value = listeningTrend.value[raw].key;
};
const parseDay = (key: string) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};
const dayFormatter = computed(() => new Intl.DateTimeFormat(locale.value, { day: '2-digit', month: 'short', year: 'numeric' }));
const tickFormatter = computed(() => new Intl.DateTimeFormat(locale.value, { day: '2-digit', month: '2-digit' }));
const formatDay = (key: string) => dayFormatter.value.format(parseDay(key));
const formatTick = (key?: string) => key ? tickFormatter.value.format(parseDay(key)) : '';
const isLive = computed(() => duration.activeStationUrl !== '');
const totalListeningMs = computed(() => duration.stats.totalMs + duration.liveMs);
const totalOnlineMs = computed(() => online.stats.totalMs + online.liveMs);
const todayListeningMs = computed(() => listeningTrend.value.at(-1)?.ms || 0);
const todayOnlineMs = computed(() => onlineTrend.value.at(-1)?.ms || 0);
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
