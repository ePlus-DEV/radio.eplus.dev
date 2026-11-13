<template>
  <section class="space-y-5" :aria-label="$t('library_navigation.overview')">
    <div class="grid grid-cols-3 gap-2 sm:gap-3">
      <NuxtLink v-for="item in summary" :key="item.to" :to="item.to"
        class="radio-interactive radio-surface flex min-w-0 flex-col items-center gap-1 rounded-2xl p-3 text-center transition hover:border-rose-500/50 sm:p-4">
        <UIcon :name="item.icon" class="h-5 w-5 text-rose-500" aria-hidden="true" />
        <strong class="text-xl font-bold tabular-nums sm:text-2xl">{{ item.count }}</strong>
        <span class="w-full truncate text-[11px] text-[var(--radio-text-muted)] sm:text-sm" :title="item.label">{{ item.label }}</span>
      </NuxtLink>
    </div>

    <!-- Stations users already saved take precedence over management forms. -->
    <div v-if="listening.library.favorites.length || listening.library.recent.length" class="radio-surface rounded-2xl p-4 sm:p-5">
      <PanelListeningLibrary compact />
    </div>
    <div v-else class="radio-surface rounded-2xl p-5 sm:p-6">
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-radio" class="mt-0.5 h-6 w-6 shrink-0 text-rose-500" aria-hidden="true" />
        <div class="min-w-0 space-y-2">
          <h2 class="text-base font-bold">{{ $t('library_navigation.empty_title') }}</h2>
          <p class="text-sm leading-6 text-[var(--radio-text-muted)]">{{ $t('library_navigation.empty_description') }}</p>
          <NuxtLink to="/" class="radio-interactive inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-rose-700 hover:bg-[var(--radio-hover)] dark:text-rose-300">
            {{ $t('library_navigation.browse') }}
            <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <section :aria-label="$t('library_navigation.organize')" class="space-y-3">
      <h2 class="text-base font-bold sm:text-lg">{{ $t('library_navigation.organize') }}</h2>
      <div class="grid gap-3 sm:grid-cols-3">
        <NuxtLink v-for="item in shortcuts" :key="item.to" :to="item.to"
          class="radio-interactive radio-surface group flex min-w-0 items-start gap-3 rounded-2xl p-4 transition hover:border-rose-500/50">
          <UIcon :name="item.icon" class="mt-0.5 h-5 w-5 shrink-0 text-rose-500" aria-hidden="true" />
          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-bold">{{ item.label }}</h3>
            <p class="mt-1 text-xs leading-5 text-[var(--radio-text-muted)]">{{ item.hint }}</p>
          </div>
          <UIcon name="i-lucide-chevron-right" class="mt-1 h-4 w-4 shrink-0 text-[var(--radio-text-muted)] transition group-hover:translate-x-0.5" aria-hidden="true" />
        </NuxtLink>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { useListeningStore } from '~/stores/listening';
import { COLLECTIONS_KEY, parseCollections } from '~/utils/personal-collections.mjs';
import { CUSTOM_STREAMS_STORAGE_KEY, parseCustomStreams } from '~/utils/custom-radio-streams.mjs';

const { t } = useI18n();
const listening = useListeningStore();
const collectionCount = ref(0);
const customCount = ref(0);

// Read on mount and on cross-tab changes only; do not expose private streams to
// search, analytics, SSR, the public station catalog, or the shared player.
const refreshLocalCounts = () => {
  if (!import.meta.client) return;
  try { collectionCount.value = parseCollections(localStorage.getItem(COLLECTIONS_KEY)).length; }
  catch { collectionCount.value = 0; /* The manager retains damaged data for recovery. */ }
  try { customCount.value = parseCustomStreams(localStorage.getItem(CUSTOM_STREAMS_STORAGE_KEY)).length; }
  catch { customCount.value = 0; }
};
const onStorage = (event: StorageEvent) => {
  if (event.key === null || event.key === COLLECTIONS_KEY || event.key === CUSTOM_STREAMS_STORAGE_KEY) refreshLocalCounts();
};
onMounted(() => {
  listening.hydrate();
  refreshLocalCounts();
  window.addEventListener('storage', onStorage);
});
onBeforeUnmount(() => window.removeEventListener('storage', onStorage));

const summary = computed(() => [
  { to: '/library#favorites', icon: 'i-lucide-heart', label: t('library.favorites'), count: listening.library.favorites.length },
  { to: '/library#collections', icon: 'i-lucide-list-music', label: t('collections.title'), count: collectionCount.value },
  { to: '/library#recent', icon: 'i-lucide-history', label: t('library.recent'), count: listening.library.recent.length },
]);
const shortcuts = computed(() => [
  { to: '/library#collections', icon: 'i-lucide-list-music', label: t('collections.title'), hint: t('library_navigation.collections_hint') },
  { to: '/library#custom', icon: 'i-lucide-radio-tower', label: t('custom_streams.title'), hint: t('library_navigation.custom_hint', { count: customCount.value }) },
  { to: '/library#stats', icon: 'i-lucide-headphones', label: t('library_navigation.activity'), hint: t('library_navigation.activity_hint') },
]);
</script>
