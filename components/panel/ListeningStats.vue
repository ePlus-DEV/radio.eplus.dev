<template>
  <section :aria-label="$t('library.listening_stats')" class="radio-stats-dashboard space-y-4">
    <!-- The two live totals intentionally stay separate: online is not listen time. -->
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      <article class="stats-hero stats-hero-listening relative min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5" :aria-label="$t('online_stats.listening')">
        <div class="relative z-10 flex items-center gap-2.5">
          <span class="stats-icon stats-icon-listening"><UIcon name="i-lucide-headphones" class="h-5 w-5" /></span>
          <h2 class="text-sm font-bold">{{ $t('online_stats.listening') }}</h2>
          <span v-if="isLive" class="ml-auto inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-1 text-[10px] font-semibold text-rose-500">
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-current" aria-hidden="true"></span>
            {{ $t('library.listening_live') }}
          </span>
        </div>
        <div class="relative z-10 mt-2 flex items-end justify-between gap-3">
          <div class="min-w-0">
            <p class="text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl">{{ formatDuration(totalListeningMs) }}</p>
            <p class="mt-2 text-xs font-medium text-rose-600 dark:text-rose-300">
              <template v-if="listeningWeekDelta !== null">
                <UIcon name="i-lucide-trending-up" class="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                {{ formatWeekDelta(listeningWeekDelta) }} · {{ $t('online_stats.vs_previous_week') }}
              </template>
              <template v-else>{{ $t('online_stats.weekly_activity') }} · {{ formatDuration(listeningWeekTotal) }}</template>
            </p>
          </div>
          <div class="stats-sparkline stats-sparkline-rose" aria-hidden="true">
            <span v-for="(day, index) in listeningHeroDays" :key="index" :style="{ height: sparkHeight(day.ms, listeningHeroPeak) }" />
          </div>
        </div>
      </article>

      <article class="stats-hero stats-hero-online relative min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5" :aria-label="$t('online_stats.online')">
        <div class="relative z-10 flex items-center gap-2.5">
          <span class="stats-icon stats-icon-online"><UIcon name="i-lucide-monitor" class="h-5 w-5" /></span>
          <h2 class="text-sm font-bold">{{ $t('online_stats.online') }}</h2>
        </div>
        <div class="relative z-10 mt-2 flex items-end justify-between gap-3">
          <div class="min-w-0">
            <p class="text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl">{{ formatDuration(totalOnlineMs) }}</p>
            <p class="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <template v-if="onlineWeekDelta !== null">
                <UIcon name="i-lucide-trending-up" class="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                {{ formatWeekDelta(onlineWeekDelta) }} · {{ $t('online_stats.vs_previous_week') }}
              </template>
              <template v-else>{{ $t('online_stats.weekly_activity') }} · {{ formatDuration(onlineWeekTotal) }}</template>
            </p>
          </div>
          <div class="stats-sparkline stats-sparkline-emerald" aria-hidden="true">
            <span v-for="(day, index) in onlineHeroDays" :key="index" :style="{ height: sparkHeight(day.ms, onlineHeroPeak) }" />
          </div>
        </div>
      </article>
    </div>

    <div class="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      <div class="stats-mini flex min-w-0 items-center gap-3 rounded-xl p-3.5">
        <span class="stats-icon stats-icon-listening shrink-0"><UIcon name="i-lucide-calendar-days" class="h-4 w-4" /></span>
        <div class="min-w-0">
          <p class="text-[11px] font-medium text-[var(--radio-text-muted)]">{{ $t('online_stats.listening_today') }}</p>
          <p class="mt-1 text-sm font-bold tabular-nums text-rose-600 dark:text-rose-300 sm:text-base">{{ formatDuration(todayListeningMs) }}</p>
        </div>
      </div>
      <div class="stats-mini flex min-w-0 items-center gap-3 rounded-xl p-3.5">
        <span class="stats-icon stats-icon-online shrink-0"><UIcon name="i-lucide-calendar-clock" class="h-4 w-4" /></span>
        <div class="min-w-0">
          <p class="text-[11px] font-medium text-[var(--radio-text-muted)]">{{ $t('online_stats.today') }}</p>
          <p class="mt-1 text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-300 sm:text-base">{{ formatDuration(todayOnlineMs) }}</p>
        </div>
      </div>
      <div class="stats-mini flex min-w-0 items-center gap-3 rounded-xl p-3.5">
        <span class="stats-icon stats-icon-indigo shrink-0"><UIcon name="i-lucide-circle-play" class="h-4 w-4" /></span>
        <div class="min-w-0">
          <p class="text-[11px] font-medium text-[var(--radio-text-muted)]">{{ $t('online_stats.stations_played') }}</p>
          <p class="mt-1 text-base font-bold tabular-nums">{{ stations.length }}</p>
        </div>
      </div>
      <div class="stats-mini flex min-w-0 items-center gap-3 rounded-xl p-3.5">
        <span class="stats-icon stats-icon-amber shrink-0"><UIcon name="i-lucide-star" class="h-4 w-4" /></span>
        <div class="min-w-0">
          <p class="text-[11px] font-medium text-[var(--radio-text-muted)]">{{ $t('online_stats.most_listened_station') }}</p>
          <NuxtLink v-if="stations.length" :to="stations[0].url" :prefetch="false" class="mt-1 block truncate text-xs font-bold hover:text-rose-500" :title="stations[0].title">{{ stations[0].title }}</NuxtLink>
          <p v-else class="mt-1 text-sm font-semibold">—</p>
        </div>
      </div>
    </div>

    <figure class="stats-chart stats-surface overflow-hidden rounded-2xl p-4 sm:p-5" :aria-label="$t('online_stats.daily_compare')">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="flex items-center gap-2 text-base font-bold sm:text-lg">
            <UIcon name="i-lucide-chart-no-axes-column-increasing" class="h-5 w-5 text-rose-500" aria-hidden="true" />
            {{ $t('online_stats.daily_compare') }}
          </h2>
          <p class="mt-1 text-xs leading-5 text-[var(--radio-text-muted)]">{{ $t('online_stats.chart_tooltip_hint') }}</p>
        </div>
        <div class="flex min-w-0 flex-wrap items-center gap-2">
          <div class="stats-segment inline-flex items-center gap-1 rounded-lg p-1" role="group" :aria-label="$t('online_stats.chart_kind')">
            <button v-for="option in chartFilters" :key="option" type="button" :aria-pressed="visibleMetric === option"
              class="stats-filter min-h-9 rounded-md px-2.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
              :class="{ 'stats-filter-active': visibleMetric === option }"
              @click="visibleMetric = option">{{ $t('online_stats.filter_' + option) }}</button>
          </div>
          <div class="stats-segment inline-flex items-center gap-1 rounded-lg p-1" role="group" :aria-label="$t('library.listening_chart_range')">
            <button v-for="days in [7, 30, 90]" :key="days" type="button" :aria-pressed="rangeDays === days"
              class="stats-filter min-h-9 rounded-md px-2.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
              :class="{ 'stats-filter-active': rangeDays === days }"
              @click="rangeDays = days">{{ $t('library.listening_last_' + days) }}</button>
          </div>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <div v-if="showListening" class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden="true"></span>
          <span class="text-[var(--radio-text-muted)]">{{ $t('online_stats.listening') }}</span>
          <strong class="tabular-nums text-rose-600 dark:text-rose-300">{{ formatDuration(listeningPeriodTotal) }}</strong>
        </div>
        <div v-if="showOnline" class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
          <span class="text-[var(--radio-text-muted)]">{{ $t('online_stats.online') }}</span>
          <strong class="tabular-nums text-emerald-700 dark:text-emerald-300">{{ formatDuration(onlinePeriodTotal) }}</strong>
        </div>
        <p class="ml-auto text-[10px] text-[var(--radio-text-muted)]">{{ $t('online_stats.independent_scales') }}</p>
      </div>

      <div class="stats-chart-plot relative mt-3 min-w-0 rounded-xl px-2 pb-2 pt-3 sm:px-3">
        <div class="mb-1 flex flex-wrap justify-between gap-2 text-[10px] font-semibold">
          <span v-if="showListening" class="text-rose-600 dark:text-rose-300">{{ $t('online_stats.listening') }} · {{ $t('online_stats.scale_max') }} {{ formatDuration(listeningGeometry.maxMs) }}</span>
          <span v-if="showOnline" class="text-emerald-700 dark:text-emerald-300">{{ $t('online_stats.online') }} · {{ $t('online_stats.scale_max') }} {{ formatDuration(onlineGeometry.maxMs) }}</span>
        </div>
        <svg v-if="visibleHasData"
          class="mt-2 block h-40 w-full cursor-crosshair touch-pan-y rounded-lg outline-offset-2 focus-visible:outline-2 focus-visible:outline-rose-500 sm:h-48"
          viewBox="0 0 800 210" preserveAspectRatio="none" role="img" tabindex="0"
          :aria-label="$t('online_stats.chart_hover_label')"
          @pointerenter="cacheChartBounds" @pointermove="onChartPointerMove" @pointerdown="onChartPointerDown"
          @pointerleave="clearChartHover" @focus="hoveredDayIndex = selectedDayIndex" @blur="hoveredDayIndex = null"
          @keydown.left.prevent="moveSelectedDay(-1)" @keydown.right.prevent="moveSelectedDay(1)">
          <defs>
            <linearGradient id="radio-listening-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#f43f8e" stop-opacity=".32" />
              <stop offset="100%" stop-color="#f43f8e" stop-opacity=".01" />
            </linearGradient>
            <linearGradient id="radio-online-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#10bfa6" stop-opacity=".22" />
              <stop offset="100%" stop-color="#10bfa6" stop-opacity="0" />
            </linearGradient>
          </defs>
          <line v-for="step in [0, 1, 2, 3, 4]" :key="'row-' + step" x1="5" x2="795"
            :y1="8 + step * 48.5" :y2="8 + step * 48.5" stroke="var(--radio-border)"
            stroke-width="1" vector-effect="non-scaling-stroke" />
          <line v-for="index in gridColumnIndices" :key="'col-' + index"
            :x1="listeningGeometry.points[index]?.x" :x2="listeningGeometry.points[index]?.x"
            y1="8" y2="202" stroke="var(--radio-border)" stroke-opacity=".55"
            stroke-width="1" vector-effect="non-scaling-stroke" />
          <path v-if="showListening" :d="listeningGeometry.areaPath" fill="url(#radio-listening-area)" />
          <path v-if="showOnline" :d="onlineGeometry.areaPath" fill="url(#radio-online-area)" />
          <path v-if="showListening" :d="listeningGeometry.linePath" fill="none" stroke="#f43f8e"
            stroke-width="3" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
          <path v-if="showOnline" :d="onlineGeometry.linePath" fill="none" stroke="#10bfa6"
            stroke-width="3" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
          <circle v-for="(point, index) in rangeDays === 7 && showListening ? listeningGeometry.points : []"
            :key="'listen-' + index" :cx="point.x" :cy="point.y" r="3.5" fill="#f43f8e"
            stroke="var(--radio-surface)" stroke-width="1.5" vector-effect="non-scaling-stroke" />
          <circle v-for="(point, index) in rangeDays === 7 && showOnline ? onlineGeometry.points : []"
            :key="'online-' + index" :cx="point.x" :cy="point.y" r="3.5" fill="#10bfa6"
            stroke="var(--radio-surface)" stroke-width="1.5" vector-effect="non-scaling-stroke" />
          <line v-if="currentListeningPoint" :x1="currentListeningPoint.x" :x2="currentListeningPoint.x"
            y1="8" y2="202" stroke="var(--radio-text-muted)" stroke-dasharray="4 4"
            opacity=".8" stroke-width="1" vector-effect="non-scaling-stroke" />
          <circle v-if="showListening && currentListeningPoint" :cx="currentListeningPoint.x" :cy="currentListeningPoint.y"
            r="5.2" fill="#f43f8e" stroke="var(--radio-surface)" stroke-width="2" vector-effect="non-scaling-stroke" />
          <circle v-if="showOnline && currentOnlinePoint" :cx="currentOnlinePoint.x" :cy="currentOnlinePoint.y"
            r="5.2" fill="#10bfa6" stroke="var(--radio-surface)" stroke-width="2" vector-effect="non-scaling-stroke" />
        </svg>
        <p v-else class="flex h-40 items-center justify-center text-sm text-[var(--radio-text-muted)] sm:h-48">
          {{ $t(visibleMetric === 'online' ? 'online_stats.daily_empty' : 'library.listening_daily_empty') }}
        </p>
        <div v-if="hoveredDayIndex !== null && visibleHasData" role="tooltip"
          class="stats-tooltip pointer-events-none absolute top-12 z-10 w-48 -translate-x-1/2 rounded-xl p-3 text-xs shadow-xl"
          :style="{ left: tooltipLeft }">
          <p class="font-bold">{{ formatDay(inspectedDateKey) }}</p>
          <div v-if="showListening" class="mt-2 flex items-center justify-between gap-2">
            <span class="text-rose-500">{{ $t('online_stats.listening') }}</span>
            <strong class="tabular-nums">{{ formatDuration(inspectedListeningMs) }}</strong>
          </div>
          <div v-if="showOnline" class="mt-1 flex items-center justify-between gap-2">
            <span class="text-emerald-500">{{ $t('online_stats.online') }}</span>
            <strong class="tabular-nums">{{ formatDuration(inspectedOnlineMs) }}</strong>
          </div>
        </div>
        <div class="mt-1 flex justify-between text-[10px] tabular-nums text-[var(--radio-text-muted)]">
          <span>{{ formatTick(listeningTrend[0]?.key) }}</span>
          <span>{{ formatTick(listeningTrend.at(-1)?.key) }}</span>
        </div>
      </div>

      <!-- Visible on touch and keyboard; chart hover alone must never be required. -->
      <div class="mt-2 px-1">
        <label class="flex items-center justify-between gap-3 text-[11px] text-[var(--radio-text-muted)]" for="radio-stats-day">
          <span>{{ $t('online_stats.selected_day') }}</span>
          <strong class="tabular-nums text-[var(--radio-text)]">{{ formatDay(selectedDateKey) }}</strong>
        </label>
        <input id="radio-stats-day" type="range" min="0" :max="Math.max(0, listeningTrend.length - 1)" step="1"
          :value="selectedDayIndex" @input="selectDayAtIndex"
          class="mt-2 h-1.5 w-full cursor-pointer accent-rose-500"
          :aria-label="$t('online_stats.select_day')" />
      </div>

      <figcaption class="stats-chart-footer mt-3 grid grid-cols-2 gap-2 rounded-xl p-3 lg:grid-cols-4">
        <div class="flex min-w-0 items-start gap-2">
          <span class="stats-icon stats-icon-listening shrink-0"><UIcon name="i-lucide-headphones" class="h-4 w-4" /></span>
          <div class="min-w-0">
            <p class="text-[10px] text-[var(--radio-text-muted)]">{{ $t('online_stats.listening_peak') }}</p>
            <p class="mt-0.5 text-sm font-bold tabular-nums text-rose-600 dark:text-rose-300">{{ formatDuration(peakListeningDay.ms) }}</p>
            <p class="mt-0.5 text-[10px] text-[var(--radio-text-muted)]">{{ formatDay(peakListeningDay.key) }}</p>
          </div>
        </div>
        <div class="flex min-w-0 items-start gap-2">
          <span class="stats-icon stats-icon-online shrink-0"><UIcon name="i-lucide-monitor" class="h-4 w-4" /></span>
          <div class="min-w-0">
            <p class="text-[10px] text-[var(--radio-text-muted)]">{{ $t('online_stats.online_peak') }}</p>
            <p class="mt-0.5 text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-300">{{ formatDuration(peakOnlineDay.ms) }}</p>
            <p class="mt-0.5 text-[10px] text-[var(--radio-text-muted)]">{{ formatDay(peakOnlineDay.key) }}</p>
          </div>
        </div>
        <div class="flex min-w-0 flex-col justify-between gap-2 border-l-0 lg:border-l lg:border-[var(--radio-border)] lg:pl-3">
          <p class="text-[11px] font-semibold">{{ $t('library.listening_tracking_title') }}</p>
          <button type="button" role="switch" :aria-checked="duration.enabled" :aria-label="$t('library.listening_tracking_title')"
            class="inline-flex min-h-9 items-center gap-2 text-left text-[10px] text-[var(--radio-text-muted)] focus-visible:outline-2 focus-visible:outline-rose-500"
            @click="duration.setTrackingEnabled(!duration.enabled)">
            <span class="stats-switch relative inline-block h-5 w-9 shrink-0 rounded-full" :class="duration.enabled ? 'bg-rose-500' : 'bg-[var(--radio-border)]'" aria-hidden="true">
              <span class="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" :class="duration.enabled ? 'translate-x-4' : ''" />
            </span>
            {{ $t(duration.enabled ? 'library.listening_tracking_on' : 'library.listening_tracking_off') }}
          </button>
        </div>
        <div class="flex min-w-0 flex-col justify-between gap-2">
          <p class="text-[11px] font-semibold">{{ $t('online_stats.tracking') }}</p>
          <button type="button" role="switch" :aria-checked="online.enabled" :aria-label="$t('online_stats.tracking')"
            class="inline-flex min-h-9 items-center gap-2 text-left text-[10px] text-[var(--radio-text-muted)] focus-visible:outline-2 focus-visible:outline-rose-500"
            @click="online.setTrackingEnabled(!online.enabled)">
            <span class="stats-switch relative inline-block h-5 w-9 shrink-0 rounded-full" :class="online.enabled ? 'bg-emerald-500' : 'bg-[var(--radio-border)]'" aria-hidden="true">
              <span class="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" :class="online.enabled ? 'translate-x-4' : ''" />
            </span>
            {{ $t(online.enabled ? 'library.listening_tracking_on' : 'library.listening_tracking_off') }}
          </button>
        </div>
      </figcaption>
      <p class="mt-2 text-[10px] leading-5 text-[var(--radio-text-muted)]">{{ $t('online_stats.combined_scales_note') }}</p>
    </figure>

    <section class="stats-ranking stats-surface rounded-2xl p-4 sm:p-5" :aria-label="$t('library.listening_top_stations')">
      <header class="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 class="flex items-center gap-2 text-base font-bold">
          <UIcon name="i-lucide-chart-no-axes-column-increasing" class="h-5 w-5 text-rose-500" aria-hidden="true" />
          {{ $t('library.listening_top_stations') }} <span class="text-xs font-normal text-[var(--radio-text-muted)]">({{ stations.length }})</span>
        </h2>
        <div class="flex items-center gap-2">
          <button v-if="stations.length > 5" type="button"
            class="inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-[var(--radio-text-muted)] transition hover:text-rose-500 focus-visible:outline-2 focus-visible:outline-rose-500"
            :aria-expanded="showAllStations" @click="showAllStations = !showAllStations">
            {{ $t(showAllStations ? 'online_stats.show_less' : 'online_stats.show_all') }}
            <UIcon :name="showAllStations ? 'i-lucide-chevron-up' : 'i-lucide-arrow-right'" class="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <UButton color="neutral" variant="ghost" icon="i-lucide-trash-2" size="xs"
            class="min-h-9" :aria-label="$t('online_stats.clear_action')" :title="$t('online_stats.clear_action')"
            @click="clearStatsOpen = true" />
        </div>
      </header>
      <div v-if="stations.length" class="space-y-1">
        <div v-for="(station, index) in visibleStations" :key="station.url"
          class="stats-ranking-row grid grid-cols-[22px_32px_minmax(0,1fr)] items-center gap-2.5 rounded-lg px-1.5 py-2 sm:grid-cols-[25px_36px_minmax(0,1fr)] sm:gap-3">
          <span class="stats-rank flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold tabular-nums"
            :class="index === 0 ? 'stats-rank-first' : index === 1 ? 'stats-rank-second' : index === 2 ? 'stats-rank-third' : ''">
            {{ index + 1 }}
          </span>
          <NuxtLink :to="station.url" :prefetch="false" tabindex="-1" aria-hidden="true"
            class="stats-ranking-artwork flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg">
            <img :src="siteAssetUrl(stationImage(station.url))" :alt="''" loading="lazy"
              class="h-full w-full object-contain p-1" @error="onStationImageError" />
          </NuxtLink>
          <div class="min-w-0">
            <div class="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
              <NuxtLink :to="station.url" :prefetch="false" class="min-w-0 truncate font-semibold hover:text-rose-500"
                :title="station.title">{{ station.title }}</NuxtLink>
              <div class="ml-auto flex shrink-0 items-center gap-3 tabular-nums text-[var(--radio-text-muted)]">
                <span>{{ formatDuration(station.ms) }}</span>
                <span class="w-9 text-right text-[11px]">{{ formatStationShare(station.ms) }}</span>
              </div>
            </div>
            <div class="stats-track mt-1.5 h-1.5 overflow-hidden rounded-full" aria-hidden="true">
              <div class="stats-progress h-full rounded-full" :style="{ width: percentOfMaxStation(station.ms) }"></div>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="py-5 text-center text-sm text-[var(--radio-text-muted)]">{{ $t('library.listening_empty') }}</p>
    </section>
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
type ChartFilter = 'both' | 'listening' | 'online';
const chartFilters: ChartFilter[] = ['both', 'listening', 'online'];
const visibleMetric = ref<ChartFilter>('both');
const rangeDays = ref(7);
const selectedDayKey = ref('');
const hoveredDayIndex = ref<number | null>(null);
const showListening = computed(() => visibleMetric.value !== 'online');
const showOnline = computed(() => visibleMetric.value !== 'listening');
const listeningTrend = computed(() => dailyListeningSeries(duration.stats, rangeDays.value, new Date(), duration.liveMs));
const onlineTrend = computed(() => dailyOnlineSeries(online.stats, rangeDays.value, new Date(), online.liveMs));
const listeningGeometry = computed(() => buildActivityTrend(listeningTrend.value, 800, 210));
const onlineGeometry = computed(() => buildActivityTrend(onlineTrend.value, 800, 210));
const visibleHasData = computed(() =>
  (showListening.value && listeningGeometry.value.hasData) ||
  (showOnline.value && onlineGeometry.value.hasData));
const listeningPeriodTotal = computed(() => listeningTrend.value.reduce((sum, day) => sum + day.ms, 0));
const onlinePeriodTotal = computed(() => onlineTrend.value.reduce((sum, day) => sum + day.ms, 0));
const selectedDayIndex = computed(() => {
  const index = listeningTrend.value.findIndex(item => item.key === selectedDayKey.value);
  return index >= 0 ? index : Math.max(0, listeningTrend.value.length - 1);
});
const inspectedDayIndex = computed(() => hoveredDayIndex.value ?? selectedDayIndex.value);
const selectedDateKey = computed(() => listeningTrend.value[selectedDayIndex.value]?.key || localDayKey());
const inspectedDateKey = computed(() => listeningTrend.value[inspectedDayIndex.value]?.key || localDayKey());
const selectedListeningMs = computed(() => listeningTrend.value[selectedDayIndex.value]?.ms || 0);
const selectedOnlineMs = computed(() => onlineTrend.value[selectedDayIndex.value]?.ms || 0);
const inspectedListeningMs = computed(() => listeningTrend.value[inspectedDayIndex.value]?.ms || 0);
const inspectedOnlineMs = computed(() => onlineTrend.value[inspectedDayIndex.value]?.ms || 0);
const currentListeningPoint = computed(() => listeningGeometry.value.points[inspectedDayIndex.value] || null);
const currentOnlinePoint = computed(() => onlineGeometry.value.points[inspectedDayIndex.value] || null);
const tooltipLeft = computed(() => {
  const count = listeningTrend.value.length;
  const percent = count > 1 ? 100 * inspectedDayIndex.value / (count - 1) : 50;
  return `${Math.min(89, Math.max(11, percent))}%`;
});
const indexFromPointer = (event: PointerEvent): number | null => {
  const svg = event.currentTarget as SVGSVGElement;
  const bounds = svg.getBoundingClientRect();
  if (!bounds.width || listeningTrend.value.length === 0) return null;
  // Translate the actual pointer into the SVG plot's [5, 795] x-window.
  const x = (event.clientX - bounds.left) / bounds.width * 800;
  const fraction = Math.min(1, Math.max(0, (x - 5) / 790));
  return Math.round(fraction * (listeningTrend.value.length - 1));
};
const onChartPointerMove = (event: PointerEvent) => {
  if (event.pointerType === 'touch' && event.buttons === 0) return;
  hoveredDayIndex.value = indexFromPointer(event);
};
const onChartPointerDown = (event: PointerEvent) => {
  const index = indexFromPointer(event);
  if (index === null) return;
  hoveredDayIndex.value = index;
  selectedDayKey.value = listeningTrend.value[index].key;
};
const moveSelectedDay = (delta: number) => {
  const index = Math.max(0, Math.min(listeningTrend.value.length - 1, inspectedDayIndex.value + delta));
  selectedDayKey.value = listeningTrend.value[index]?.key || '';
  hoveredDayIndex.value = index;
};
const selectDayAtIndex = (event: Event) => {
  const raw = Number((event.target as HTMLInputElement).value);
  if (!Number.isInteger(raw) || raw < 0 || raw >= listeningTrend.value.length) return;
  selectedDayKey.value = listeningTrend.value[raw].key;
  hoveredDayIndex.value = null;
};
watch([rangeDays, visibleMetric], () => { hoveredDayIndex.value = null; });
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
