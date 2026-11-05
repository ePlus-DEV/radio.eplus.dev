<template>
  <section id="discover-stations" class="scroll-mt-24 rounded-2xl border border-[var(--radio-border)] bg-[var(--radio-surface)] p-4 sm:p-5"
    :aria-label="$t('discovery.title')">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex min-w-0 items-start gap-3">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-300" aria-hidden="true">
          <UIcon name="i-lucide-list-filter" class="h-5 w-5" />
        </span>
        <div class="min-w-0">
          <h2 class="text-base font-bold sm:text-lg">{{ $t('discovery.title') }}</h2>
          <p class="mt-1 max-w-xl text-xs leading-5 text-[var(--radio-text-muted)]">{{ $t('discovery.description') }}</p>
        </div>
      </div>
      <UButton color="neutral" variant="outline" class="min-h-11 shrink-0"
        :aria-expanded="open" aria-controls="discovery-browse-panel"
        :trailing-icon="open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        @click="toggleOpen">{{ $t(open ? 'discovery.hide' : 'discovery.browse') }}</UButton>
    </div>

    <div v-if="open" id="discovery-browse-panel" class="mt-4 border-t border-[var(--radio-border)] pt-4">
      <p v-if="loading" role="status" class="py-3 text-sm text-[var(--radio-text-muted)]">{{ $t('discovery.loading') }}</p>
      <div v-else-if="error && !index.length" role="alert" class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--radio-border)] p-3">
        <span class="text-xs text-[var(--radio-text-muted)]">{{ $t('discovery.unavailable') }}</span>
        <UButton color="neutral" variant="outline" size="sm" class="min-h-10" @click="load">{{ $t('discovery.retry') }}</UButton>
      </div>

      <template v-if="index.length">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label class="min-w-0 text-xs font-semibold text-[var(--radio-text-muted)]">
            {{ $t('discovery.search') }}
            <input v-model="query" type="search" autocomplete="off"
              class="mt-1 block min-h-11 w-full rounded-lg border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] px-3 text-sm font-normal text-[var(--radio-text)] placeholder:text-[var(--radio-text-muted)] focus-visible:outline-2 focus-visible:outline-rose-500"
              :placeholder="$t('discovery.search_placeholder')" />
          </label>
          <label class="min-w-0 text-xs font-semibold text-[var(--radio-text-muted)]">
            {{ $t('discovery.country') }}
            <select v-model="country" class="mt-1 block min-h-11 w-full min-w-0 rounded-lg border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] px-3 text-sm font-normal text-[var(--radio-text)] focus-visible:outline-2 focus-visible:outline-rose-500">
              <option value="">{{ $t('discovery.all_countries') }}</option>
              <option v-for="key in countries" :key="key" :value="key">{{ $t(key) }}</option>
            </select>
          </label>
          <label class="min-w-0 text-xs font-semibold text-[var(--radio-text-muted)]">
            {{ $t('discovery.genre') }}
            <select v-model="genre" class="mt-1 block min-h-11 w-full min-w-0 rounded-lg border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] px-3 text-sm font-normal text-[var(--radio-text)] focus-visible:outline-2 focus-visible:outline-rose-500">
              <option value="">{{ $t('discovery.all_genres') }}</option>
              <option v-for="value in genres" :key="value" :value="value">{{ value }}</option>
            </select>
          </label>
          <label class="min-w-0 text-xs font-semibold text-[var(--radio-text-muted)]">
            {{ $t('discovery.language') }}
            <select v-model="language" class="mt-1 block min-h-11 w-full min-w-0 rounded-lg border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] px-3 text-sm font-normal text-[var(--radio-text)] focus-visible:outline-2 focus-visible:outline-rose-500">
              <option value="">{{ $t('discovery.all_languages') }}</option>
              <option v-for="value in languages" :key="value" :value="value">{{ value }}</option>
            </select>
          </label>
        </div>

        <div class="my-4 flex flex-wrap items-center justify-between gap-2">
          <p role="status" aria-live="polite" class="text-xs tabular-nums text-[var(--radio-text-muted)]">
            {{ $t('discovery.results', { from: pageData.from, to: pageData.to, total: pageData.total }) }}
          </p>
          <UButton v-if="hasFilters" color="neutral" variant="ghost" size="sm" class="min-h-10" icon="i-lucide-rotate-ccw" @click="resetFilters">
            {{ $t('discovery.reset') }}
          </UButton>
        </div>

        <div v-if="pageData.items.length" class="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          <NuxtLink v-for="station in pageData.items" :key="station.url" :to="station.url" :prefetch="false"
            class="radio-interactive flex min-h-20 min-w-0 items-center gap-3 rounded-xl border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] p-3 transition hover:border-rose-500/50 hover:bg-[var(--radio-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500">
            <img :src="siteAssetUrl(station.station_image || '/brand/onair-mark.svg')" alt="" loading="lazy" decoding="async"
              width="48" height="48" class="radio-themed-artwork h-12 w-12 shrink-0 rounded-lg object-contain p-1" />
            <span class="min-w-0 flex-1">
              <span dir="auto" class="block truncate text-sm font-semibold">{{ station.station_name }}</span>
              <span class="mt-1 block truncate text-xs text-[var(--radio-text-muted)]">{{ station.station_country ? $t(station.station_country) : '' }}</span>
              <span v-if="station.station_category" class="mt-1 block truncate text-[11px] text-rose-600 dark:text-rose-300">{{ station.station_category }}</span>
            </span>
            <UIcon name="i-lucide-arrow-up-right" class="h-4 w-4 shrink-0 text-[var(--radio-text-muted)]" aria-hidden="true" />
          </NuxtLink>
        </div>
        <p v-else role="status" class="rounded-xl border border-dashed border-[var(--radio-border)] px-4 py-6 text-center text-sm text-[var(--radio-text-muted)]">
          {{ $t('discovery.empty') }}
        </p>

        <nav v-if="pageData.pageCount > 1" class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--radio-border)] pt-4"
          :aria-label="$t('discovery.pagination')">
          <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-chevron-left" class="min-h-10"
            :disabled="!pageData.hasPrevious" @click="page = pageData.page - 1">{{ $t('discovery.previous') }}</UButton>
          <span class="text-xs tabular-nums text-[var(--radio-text-muted)]">{{ $t('discovery.page', { page: pageData.page, total: pageData.pageCount }) }}</span>
          <UButton color="neutral" variant="outline" size="sm" trailing-icon="i-lucide-chevron-right" class="min-h-10"
            :disabled="!pageData.hasNext" @click="page = pageData.page + 1">{{ $t('discovery.next') }}</UButton>
        </nav>
        <p class="mt-3 text-[11px] leading-5 text-[var(--radio-text-muted)]">{{ $t('discovery.metadata_note') }}</p>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { discoveryFacetValues, paginateDiscoveryStations } from '~/utils/station-discovery.mjs';

const siteAssetUrl = useSiteAssetUrl();
const { index, load, loading, error } = useStationSearchIndex();
const open = ref(false);
const query = ref('');
const country = ref('');
const genre = ref('');
const language = ref('');
const page = ref(1);

const filters = computed(() => ({
  query: query.value, country: country.value, genre: genre.value, language: language.value,
}));
const hasFilters = computed(() => Boolean(query.value || country.value || genre.value || language.value));
const countries = computed(() => discoveryFacetValues(index.value, 'station_country', filters.value));
const genres = computed(() => discoveryFacetValues(index.value, 'station_category', filters.value));
const languages = computed(() => discoveryFacetValues(index.value, 'station_language', filters.value));
const pageData = computed(() => paginateDiscoveryStations(index.value, { ...filters.value, page: page.value }));

watch([query, country, genre, language], () => { page.value = 1; });
watch(country, () => { genre.value = ''; language.value = ''; });
watch(genre, () => { language.value = ''; });

const toggleOpen = () => {
  open.value = !open.value;
  if (open.value) void load();
};
const resetFilters = () => {
  query.value = ''; country.value = ''; genre.value = ''; language.value = ''; page.value = 1;
};
</script>
