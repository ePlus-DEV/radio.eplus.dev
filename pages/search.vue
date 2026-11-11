<template>
  <div class="space-y-4 sm:space-y-5">
    <header class="radio-surface flex flex-wrap items-center gap-4 rounded-3xl p-5 sm:p-7">
      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
        <UIcon name="i-lucide-search" class="h-6 w-6" />
      </div>
      <div class="min-w-0">
        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ t('search.results_title') }}</h1>
        <p v-if="query" dir="auto" class="mt-1 truncate text-sm leading-6 text-[var(--radio-text-muted)]">
          “{{ query }}”
        </p>
      </div>
    </header>

    <section class="radio-surface rounded-3xl p-4 sm:p-5">
      <form @submit.prevent="submitSearch">
        <!-- Match the header search box exactly (components/search/Box.vue):
             same surface class, height, radius and icon placement. -->
        <div class="relative">
          <fa
            :icon="['fas', 'magnifying-glass']"
            class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--radio-text-muted)]"
          />
          <UInput
            v-model="draft"
            type="search"
            class="w-full"
            :ui="{ base: 'radio-search-panel-input h-11 rounded-2xl pl-11 pr-4 text-sm' }"
            :placeholder="t('popup.search.text')"
            :aria-label="t('popup.search.text')"
          />
        </div>
      </form>

      <ClientOnly>
        <p v-if="loading" class="px-2 py-8 text-center text-sm text-[var(--radio-text-muted)]" role="status">
          {{ t('search.loading') }}
        </p>
        <p v-else-if="error" class="px-2 py-8 text-center text-sm text-[var(--radio-text-muted)]" role="status">
          {{ t('search.unavailable') }}
        </p>
        <template v-else>
          <p class="px-2 pb-1 pt-4 text-xs font-semibold tabular-nums text-[var(--radio-text-muted)]">
            {{ t('panel.station_count', { count: results.length }) }}
          </p>
          <SearchResult :result="results" />
          <p v-if="!results.length" class="px-3 py-8 text-center text-sm text-[var(--radio-text-muted)]" role="status">
            {{ t('panel.no_channels') }}
          </p>
        </template>
        <template #fallback>
          <p class="px-2 py-8 text-center text-sm text-[var(--radio-text-muted)]" role="status">
            {{ t('search.loading') }}
          </p>
        </template>
      </ClientOnly>
    </section>
  </div>
</template>

<script setup lang="ts">
import { searchLocalStations } from '~/utils/station-search.mjs';

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const { t } = useI18n();

const query = computed(() => {
  const raw = route.query.q;
  return (Array.isArray(raw) ? raw[0] : raw || '').trim();
});

// The input edits a draft; the URL query stays the single source of truth so
// the page remains shareable and Back/Forward restore earlier searches.
const draft = ref(query.value);
watch(query, value => { draft.value = value; });

// The static search index loads client-side only, on page mount.
const { index, loading, error, load } = useStationSearchIndex();
onMounted(() => { void load(); });
const results = computed(() => searchLocalStations(index.value, query.value, 100));

let debounce: ReturnType<typeof setTimeout> | null = null;
const applyQuery = (value: string): void => {
  const next = value.trim();
  if (next === query.value) return;
  void router.replace({ path: '/search', query: next ? { q: next } : {} });
};
watch(draft, value => {
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(() => applyQuery(value), 350);
});
const submitSearch = (): void => {
  if (debounce) clearTimeout(debounce);
  applyQuery(draft.value);
};
onBeforeUnmount(() => { if (debounce) clearTimeout(debounce); });

useHead(() => ({
  title: query.value ? `${t('search.results_title')} · ${query.value}` : t('search.results_title'),
  meta: [{ name: 'robots', content: config.public.noIndex ? 'noindex, nofollow, noarchive' : 'noindex, follow' }],
}));
</script>
