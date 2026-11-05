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

    <section v-if="!canListenOnEplus" class="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4" :aria-label="t('global_radio.playback_status_title')">
      <UIcon name="i-lucide-info" class="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
      <div class="min-w-0 space-y-1">
        <h2 class="text-sm font-bold text-amber-800 dark:text-amber-200">{{ t('global_radio.playback_status_title') }}</h2>
        <p class="text-xs leading-6 text-[var(--radio-text-muted)]">{{ t('global_radio.playback_status_pending') }}</p>
        <p class="text-xs leading-6 text-[var(--radio-text-muted)]">{{ t('global_radio.apple_access') }}</p>
      </div>
    </section>
    <p v-else class="flex items-start gap-2 rounded-xl border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] p-3 text-xs leading-6 text-[var(--radio-text-muted)]">
      <UIcon name="i-lucide-info" class="mt-1 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
      <span>{{ t('global_radio.apple_access') }} {{ t('global_radio.playback_status_configured') }}</span>
    </p>

    <p v-if="resolverError" role="alert" class="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
      {{ t('global_radio.resolver_unavailable') }}
    </p>

    <section :aria-label="t('global_radio.stations')" class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-lg font-bold">{{ t('global_radio.stations') }}</h2>
        <span class="text-xs tabular-nums text-[var(--radio-text-muted)]">
          {{ provider?.stations.length || 0 }} {{ t('global_radio.station_count') }}
        </span>
      </div>
      <div class="grid min-w-0 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        <article v-for="station in provider?.stations || []" :key="station.id"
          class="radio-surface group flex min-w-0 flex-col gap-3 rounded-2xl border border-[var(--radio-border)] p-4 transition-colors hover:border-rose-500/45 focus-within:border-rose-500/50 sm:p-5">
          <div class="flex min-w-0 items-start gap-3">
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/25 to-pink-900/15 text-rose-500"
              aria-hidden="true">
              <UIcon name="i-lucide-radio" class="h-6 w-6" />
            </span>
            <div class="min-w-0 flex-1">
              <NuxtLink :to="`/global-radio/apple-music/${station.id}`"
                class="block line-clamp-2 text-sm font-bold hover:text-rose-500 sm:text-base">
                {{ station.title }}
              </NuxtLink>
              <p class="mt-1 text-xs text-[var(--radio-text-muted)]">
                {{ station.genre }} · {{ station.language.toUpperCase() }}
              </p>
            </div>
          </div>
          <span v-if="station.seasonal" class="inline-flex w-fit items-center gap-1 rounded-md border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
            <UIcon name="i-lucide-snowflake" class="h-3.5 w-3.5" aria-hidden="true" />
            {{ t('global_radio.seasonal') }}
          </span>
          <p class="line-clamp-3 min-h-0 flex-1 text-sm leading-6 text-[var(--radio-text-muted)]">
            {{ station.description }}
          </p>
          <!-- In-app play appears only with an explicitly configured, approved resolver.
               The default public experience remains the official provider links. -->
          <div class="mt-auto space-y-2">
            <button v-if="canListenOnEplus" type="button"
              class="radio-interactive inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-500 bg-rose-600 px-3 text-xs font-bold text-white transition-colors hover:bg-rose-700 disabled:cursor-wait disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
              :disabled="Boolean(pendingStationId)" @click="playOnEplus(station)">
              <UIcon :name="pendingStationId === station.id ? 'i-lucide-loader-circle' : 'i-lucide-play'"
                :class="pendingStationId === station.id ? 'h-4 w-4 animate-spin' : 'h-4 w-4'" aria-hidden="true" />
              {{ t(pendingStationId === station.id ? 'global_radio.connecting_on_eplus' : 'global_radio.listen_on_eplus') }}
            </button>
            <span v-if="!canListenOnEplus" class="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] px-3 py-1 text-[11px] font-medium text-[var(--radio-text-muted)]">
              <UIcon name="i-lucide-circle-alert" class="h-3.5 w-3.5" aria-hidden="true" />
              {{ t('global_radio.playback_status_short') }}
            </span>
            <a :href="station.listen_url" target="_blank" rel="noopener noreferrer"
              class="radio-interactive inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 text-xs font-bold text-white transition-colors hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500">
              <UIcon name="i-lucide-external-link" class="h-4 w-4 shrink-0" aria-hidden="true" />
              {{ t('global_radio.listen_on_apple') }}
            </a>
            <div class="flex min-w-0 items-center justify-between gap-2">
              <NuxtLink :to="`/global-radio/apple-music/${station.id}`"
                class="radio-interactive inline-flex min-h-10 min-w-0 items-center gap-1 text-xs font-semibold text-rose-700 hover:underline dark:text-rose-300">
                {{ t('global_radio.details') }}
                <UIcon name="i-lucide-chevron-right" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </NuxtLink>
              <a v-if="station.tunein_url" :href="station.tunein_url" target="_blank" rel="noopener noreferrer"
                class="radio-interactive inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--radio-border)] px-3 text-xs font-semibold text-[var(--radio-text)] transition-colors hover:border-rose-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500">
                {{ t('global_radio.listen_on_tunein') }}
                <UIcon name="i-lucide-external-link" class="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { data: provider } = await useAppleMusicProvider();
const {
  enabled: canListenOnEplus,
  play: playOnEplus,
  pendingStationId,
  error: resolverError,
} = useAuthorizedGlobalRadioPlayback();
const title = computed(() => 'Apple Music Radio');
const description = computed(() => t('global_radio.apple_description'));
useStaticPageSeo({ title, description });
</script>
