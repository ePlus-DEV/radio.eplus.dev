<template>
  <div class="min-w-0 space-y-6 sm:space-y-8">
    <nav class="flex flex-wrap items-center gap-2 text-xs text-[var(--radio-text-muted)]"
      :aria-label="t('global_radio.breadcrumb')">
      <NuxtLink to="/" class="hover:text-rose-500">{{ t('global_radio.home') }}</NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="h-3.5 w-3.5" aria-hidden="true" />
      <NuxtLink to="/global-radio" class="hover:text-rose-500">{{ t('global_radio.title') }}</NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="h-3.5 w-3.5" aria-hidden="true" />
      <span aria-current="page">{{ provider?.name }}</span>
    </nav>

    <!-- Visual-only hero: no fabricated playback state and no third-party image downloads. -->
    <header class="radio-hero relative isolate overflow-hidden rounded-3xl border border-rose-500/15 p-5 sm:p-7 lg:p-8">
      <div class="pointer-events-none absolute inset-0 opacity-70 dark:opacity-100" aria-hidden="true"
        style="background: radial-gradient(ellipse at 88% 35%, rgb(244 63 94 / .20), transparent 43%), radial-gradient(ellipse at 40% 110%, rgb(124 58 237 / .15), transparent 60%)" />
      <svg class="pointer-events-none absolute -right-6 top-0 hidden h-full w-[42%] text-rose-500/30 md:block"
        viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
        <path v-for="offset in [0, 14, 28, 42, 56, 70]" :key="offset"
          :d="`M-20 ${110 - offset} C 75 ${-20 + offset}, 155 ${200 - offset}, 340 ${32 + offset}`"
          stroke="currentColor" stroke-width="2" />
      </svg>
      <div class="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-700 text-white shadow-lg shadow-rose-900/15 sm:h-20 sm:w-20"
          aria-hidden="true">
          <UIcon name="i-lucide-radio-tower" class="h-8 w-8 sm:h-9 sm:w-9" />
        </div>
        <div class="min-w-0 max-w-2xl flex-1">
          <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-300">
            {{ t('global_radio.eyebrow') }}
          </p>
          <h1 class="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{{ provider?.name }}</h1>
          <p class="mt-2 text-sm leading-6 text-[var(--radio-text-muted)]">{{ t('global_radio.apple_description') }}</p>
          <div class="mt-4 flex flex-wrap gap-2 text-xs">
            <span class="inline-flex items-center gap-1.5 rounded-full border border-[var(--radio-border)] bg-[var(--radio-surface)]/70 px-3 py-1.5">
              <UIcon name="i-lucide-radio" class="h-3.5 w-3.5 text-rose-500" aria-hidden="true" />
              {{ provider?.stations.length || 0 }} {{ t('global_radio.station_count') }}
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-[var(--radio-border)] bg-[var(--radio-surface)]/70 px-3 py-1.5">
              <UIcon name="i-lucide-globe-2" class="h-3.5 w-3.5 text-rose-500" aria-hidden="true" />
              {{ t('global_radio.title') }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Playback is now in-app; provider-account information belongs on details. -->
    <p class="flex items-center gap-2 text-xs leading-5 text-[var(--radio-text-muted)] sm:text-sm">
      <UIcon name="i-lucide-headphones" class="h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
      <span>{{ t('global_radio.eplus_play_hint') }}</span>
    </p>

    <p v-if="!canListenOnEplus" role="status" class="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
      {{ t('global_radio.resolver_unavailable') }}
    </p>

    <p v-if="resolverError" role="alert" class="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
      {{ t('global_radio.resolver_unavailable') }}
    </p>

    <!-- Reuse the same responsive 2/3/4/5-column cards and floating Play button as Country Radio. -->
    <PanelStation
      :stations="stationCards"
      :active-station-id="activeStationId"
      :country-name="t('global_radio.stations')"
      eyebrow-key="global_radio.eyebrow"
      :play-enabled="canListenOnEplus"
      :pending-station-id="pendingStationId"
      :disabled-reason="t('global_radio.resolver_unavailable')"
      @select-station="playSelectedStation"
    />
  </div>
</template>

<script setup lang="ts">
import { usePlaybackStore } from '~/stores/playback';
import { useListeningStore } from '~/stores/listening';
import type { RadioStationOption } from '~/types/radio';

const { t } = useI18n();
const { data: provider } = await useAppleMusicProvider();
const playback = usePlaybackStore();
const listening = useListeningStore();
const {
  enabled: canListenOnEplus,
  play: playOnEplus,
  prepare: prepareOnEplus,
  pendingStationId,
  error: resolverError,
} = useAuthorizedGlobalRadioPlayback(() => provider.value?.stations || []);
const stationCards = computed<RadioStationOption[]>(() => (provider.value?.stations || []).map(station => ({
  id: station.id,
  title: station.title,
  image: station.image || '/brand/onair-mark.svg',
  url: '/global-radio/apple-music/' + station.id,
})));
const activeStationId = computed(() =>
  playback.station?.url.startsWith('/global-radio/apple-music/') ? playback.station.id : ''
);
const playSelectedStation = (selected: RadioStationOption): void => {
  // Card supplies public metadata only; resolve HLS solely for the chosen station.
  const station = provider.value?.stations.find(item => item.id === selected.id);
  if (station) void playOnEplus(station);
};
// Match Country's idle selection without autoplay. Only the first station
// resolves in the background; other stations are fetched solely on selection.
onMounted(() => {
  listening.hydrate();
  if (listening.library.lastStation || playback.station || playback.requestedStationUrl) return;
  const firstStation = provider.value?.stations[0];
  if (firstStation) void prepareOnEplus(firstStation);
});

const title = computed(() => 'Apple Music Radio');
const description = computed(() => t('global_radio.apple_description'));
useStaticPageSeo({ title, description });
</script>
