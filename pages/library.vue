<template>
  <div class="space-y-6">
    <div><h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('redesign.library') }}</h1><p class="mt-2 text-sm text-[var(--radio-text-muted)]">{{ $t('redesign.library_description') }}</p></div>
    <UTabs :model-value="active" :items="tabs" :content="false" :aria-label="$t('redesign.library')" @update:model-value="selectTab" />
    <ClientOnly><PanelListeningStats v-if="active === 'stats'" /><PanelListeningLibrary v-else :group="active" /><template #fallback><p class="radio-surface p-5 text-sm text-[var(--radio-text-muted)]">{{ $t('library.loading') }}</p></template></ClientOnly>
  </div>
</template>
<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();
const { t } = useI18n();
const clientReady = ref(false);
onMounted(() => { clientReady.value = true; });
const active = computed(() => clientReady.value && ['favorites', 'recent', 'stats'].includes(route.hash.slice(1)) ? route.hash.slice(1) : 'all');
const tabs = computed(() => [
  { label: t('redesign.all'), value: 'all', icon: 'i-lucide-library' },
  { label: t('library.favorites'), value: 'favorites', icon: 'i-lucide-heart' },
  { label: t('library.recent'), value: 'recent', icon: 'i-lucide-history' },
  { label: t('library.listening_stats'), value: 'stats', icon: 'i-lucide-chart-no-axes-column-increasing' },
]);
const selectTab = (value: string | number) => { void navigateTo(`/library${value === 'all' ? '' : `#${value}`}`, { replace: true }); };
useHead(() => ({ title: t('redesign.library'), meta: [{ name: 'robots', content: config.public.noIndex ? 'noindex, nofollow, noarchive' : 'noindex, follow' }] }));
</script>
