<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('redesign.library') }}</h1>
      <p class="mt-2 text-sm text-[var(--radio-text-muted)]">{{ $t('redesign.library_description') }}</p>
    </header>

    <!-- These are real URL links, not controlled UTabs buttons:
         navigation history and deep links must remain first-class. -->
    <nav class="radio-library-tabs rounded-2xl border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] p-1.5"
      :aria-label="$t('redesign.library')">
      <div class="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <NuxtLink v-for="tab in tabs" :key="tab.value" :to="libraryTabHref(tab.value)" custom v-slot="{ href, navigate }">
          <!-- Vue Router's automatic isExactActive ignores hashes. Render the
               anchor ourselves so aria-current reflects the actual panel. -->
          <a
            :href="href"
            :title="tab.label"
            :aria-current="clientReady && active === tab.value ? 'location' : undefined"
            class="radio-interactive flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl px-2.5 py-2.5 text-center text-sm font-semibold motion-safe:transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 sm:px-3"
            :class="clientReady && active === tab.value
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-950/15 dark:bg-rose-600'
              : 'text-[var(--radio-text-muted)] hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]'"
            @click="navigate"
          >
            <UIcon :name="tab.icon" class="h-4 w-4 shrink-0" aria-hidden="true" />
            <span class="min-w-0 truncate">{{ tab.label }}</span>
          </a>
        </NuxtLink>
      </div>
    </nav>

    <ClientOnly>
      <PanelListeningStats v-if="active === 'stats'" />
      <PanelListeningLibrary v-else :group="active" />
      <template #fallback>
        <p class="radio-surface p-5 text-sm text-[var(--radio-text-muted)]">{{ $t('library.loading') }}</p>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { libraryTabFromHash, libraryTabHref } from '~/utils/library-tabs.mjs';

const route = useRoute();
const config = useRuntimeConfig();
const { t } = useI18n();

// URL fragments are unavailable during SSR. Avoid a wrong active highlight
// until hydration, when Vue Router knows the browser's actual hash.
const clientReady = ref(false);
onMounted(() => { clientReady.value = true; });
const active = computed(() => clientReady.value ? libraryTabFromHash(route.hash) : 'all');
const tabs = computed(() => [
  { label: t('redesign.all'), value: 'all', icon: 'i-lucide-library' },
  { label: t('library.favorites'), value: 'favorites', icon: 'i-lucide-heart' },
  { label: t('library.recent'), value: 'recent', icon: 'i-lucide-history' },
  { label: t('library.listening_stats'), value: 'stats', icon: 'i-lucide-chart-no-axes-column-increasing' },
]);
useHead(() => ({ title: t('redesign.library'), meta: [{ name: 'robots', content: config.public.noIndex ? 'noindex, nofollow, noarchive' : 'noindex, follow' }] }));
</script>
