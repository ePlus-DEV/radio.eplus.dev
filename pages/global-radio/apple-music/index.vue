<template>
  <div class="space-y-6 sm:space-y-8">
    <nav class="flex flex-wrap items-center gap-2 text-xs text-[var(--radio-text-muted)]" :aria-label="t('global_radio.breadcrumb')">
      <NuxtLink to="/" class="hover:text-rose-500">{{ t('global_radio.home') }}</NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="h-3.5 w-3.5" aria-hidden="true" />
      <NuxtLink to="/global-radio" class="hover:text-rose-500">{{ t('global_radio.title') }}</NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="h-3.5 w-3.5" aria-hidden="true" />
      <span aria-current="page">{{ provider?.name }}</span>
    </nav>

    <header class="radio-hero rounded-2xl p-5 sm:p-8">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="max-w-2xl">
          <p class="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-300">{{ t('global_radio.eyebrow') }}</p>
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ provider?.name }}</h1>
          <p class="mt-3 text-sm leading-6 text-[var(--radio-text-muted)]">{{ t('global_radio.apple_description') }}</p>
        </div>
        <a v-if="provider" :href="provider.homepage" target="_blank" rel="noopener noreferrer"
          class="radio-interactive inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--radio-border)] bg-[var(--radio-surface)] px-4 text-xs font-semibold text-[var(--radio-text)] hover:border-rose-500">
          {{ t('global_radio.open_provider') }}
          <UIcon name="i-lucide-external-link" class="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
      <p class="mt-4 rounded-xl border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] p-3 text-xs leading-6 text-[var(--radio-text-muted)]">
        <UIcon name="i-lucide-info" class="mr-1 inline-block h-4 w-4 align-text-bottom" aria-hidden="true" />
        {{ t('global_radio.apple_access') }}
      </p>
    </header>

    <section :aria-label="t('global_radio.stations')" class="space-y-4">
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-lg font-bold">{{ t('global_radio.stations') }}</h2>
        <span class="text-xs text-[var(--radio-text-muted)]">{{ provider?.stations.length || 0 }} {{ t('global_radio.station_count') }}</span>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        <article v-for="station in provider?.stations || []" :key="station.id"
          class="radio-surface flex min-w-0 flex-col gap-4 rounded-2xl p-4 sm:p-5">
          <div class="flex items-start gap-3">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <UIcon name="i-lucide-radio" class="h-5 w-5" aria-hidden="true" />
            </span>
            <div class="min-w-0 flex-1">
              <NuxtLink :to="`/global-radio/apple-music/${station.id}`" class="line-clamp-2 text-sm font-bold hover:text-rose-500 sm:text-base">{{ station.title }}</NuxtLink>
              <p class="mt-1 text-xs text-[var(--radio-text-muted)]">{{ station.genre }} · {{ station.language.toUpperCase() }}</p>
              <span v-if="station.seasonal" class="mt-2 inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                <UIcon name="i-lucide-snowflake" class="h-3.5 w-3.5" aria-hidden="true" /> {{ t('global_radio.seasonal') }}
              </span>
            </div>
          </div>
          <p class="line-clamp-3 text-sm leading-6 text-[var(--radio-text-muted)]">{{ station.description }}</p>
          <div class="mt-auto space-y-3">
            <!-- A signed Apple HLS URL is needed; this is NOT automatic Apple playback. -->
            <button type="button" class="radio-interactive flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
              :title="t('global_radio.preview_requires_url')"
              @click="openPreview(station)">
              <UIcon name="i-lucide-circle-play" class="h-4 w-4 shrink-0" aria-hidden="true" />
              {{ t('global_radio.preview_on_eplus') }}
            </button>
            <div class="flex flex-wrap items-center gap-2">
              <NuxtLink :to="`/global-radio/apple-music/${station.id}`"
                class="radio-interactive inline-flex min-h-10 items-center text-xs font-semibold text-rose-700 hover:underline dark:text-rose-300">
                {{ t('global_radio.details') }}
              </NuxtLink>
              <a v-if="station.tunein_url" :href="station.tunein_url" target="_blank" rel="noopener noreferrer"
                class="radio-interactive inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[var(--radio-border)] px-3 text-xs font-semibold text-[var(--radio-text)] hover:border-rose-500">
                {{ t('global_radio.listen_on_tunein') }} <UIcon name="i-lucide-external-link" class="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <a :href="station.listen_url" target="_blank" rel="noopener noreferrer"
                class="radio-interactive inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[var(--radio-border)] px-3 text-xs font-semibold text-[var(--radio-text)] hover:border-rose-500">
                {{ t('global_radio.listen_on_apple') }} <UIcon name="i-lucide-external-link" class="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
    <p class="text-xs leading-5 text-[var(--radio-text-muted)]">{{ t('global_radio.external_note') }}</p>

    <!-- One modal per page, not seven audio elements mounted in seven cards. -->
    <UModal v-model:open="previewOpen"
      :title="previewStation ? `${t('global_radio.preview_on_eplus')} · ${previewStation.title}` : t('global_radio.preview_on_eplus')"
      :description="t('global_radio.preview_requires_url')"
      :ui="{
        content: 'radio-station-stats-modal max-w-2xl bg-[var(--radio-station-dialog-bg)] text-[var(--radio-text)]',
        overlay: 'radio-station-stats-overlay',
        body: 'min-w-0 max-h-[75dvh] overflow-y-auto',
      }">
      <template #body>
        <ClientOnly>
          <GlobalRadioTemporaryHlsPreview v-if="previewOpen && previewStation"
            :station="previewStation" :expanded="true" />
        </ClientOnly>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { GlobalRadioStation } from '~/types/global-radio';
const { t } = useI18n();
const { data: provider } = await useAppleMusicProvider();
const previewOpen = ref(false);
const previewStation = shallowRef<GlobalRadioStation | null>(null);
function openPreview(station: GlobalRadioStation) {
  previewStation.value = station;
  previewOpen.value = true;
}
// Stop and destroy the preview audio whenever the modal closes, even when
// it was closed through Escape or the overlay rather than the Stop button.
watch(previewOpen, (open) => {
  if (!open) previewStation.value = null;
});
const title = computed(() => 'Apple Music Radio');
const description = computed(() => t('global_radio.apple_description'));
useStaticPageSeo({ title, description });
</script>
