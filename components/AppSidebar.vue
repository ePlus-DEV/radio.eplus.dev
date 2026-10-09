<template>
  <aside :class="mobile ? 'block' : 'hidden xl:block'" class="min-w-0" :aria-label="$t('sidebar.browse_radio')">
    <div :class="mobile ? 'space-y-6' : 'sticky top-28 max-h-[calc(100dvh-9rem-var(--radio-player-height))] space-y-6 overflow-y-auto pb-8 pr-2 radio-scrollbar'">
      <div class="space-y-1">
        <NuxtLink to="/" class="radio-interactive flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition"
          :class="route.path === '/' ? 'bg-rose-500/10 text-rose-500' : 'text-[var(--radio-text-muted)] hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]'">
          <fa :icon="['fas', 'house']" class="w-4" />
          <span>{{ $t('redesign.discover') }}</span>
        </NuxtLink>
        <NuxtLink v-for="item in [{ hash: 'favorites', icon: 'i-lucide-heart' }, { hash: 'recent', icon: 'i-lucide-history' }]" :key="item.hash" :to="`/library#${item.hash}`" class="radio-interactive flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold" :class="route.path === '/library' && route.hash === `#${item.hash}` ? 'bg-rose-500/10 text-rose-500' : 'text-[var(--radio-text-muted)] hover:bg-[var(--radio-hover)]'">
          <UIcon :name="item.icon" class="h-4 w-4" /><span>{{ $t(`library.${item.hash}`) }}</span>
        </NuxtLink>
        <NuxtLink to="/statistics" class="radio-interactive flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition"
          :class="route.path === '/statistics' ? 'bg-rose-500/10 text-rose-500' : 'text-[var(--radio-text-muted)] hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]'">
          <fa :icon="['fas', 'chart-simple']" class="w-4" />
          <span>{{ $t('navmenu.statistics') }}</span>
        </NuxtLink>
        <NuxtLink to="/about" class="radio-interactive flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition"
          :class="route.path === '/about' ? 'bg-rose-500/10 text-rose-500' : 'text-[var(--radio-text-muted)] hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]'">
          <fa :icon="['fas', 'circle-info']" class="w-4" />
          <span>{{ $t('navmenu.about') }}</span>
        </NuxtLink>
        <button type="button" class="radio-interactive flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[var(--radio-text-muted)] transition hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]" @click="focusSearch">
          <fa :icon="['fas', 'magnifying-glass']" class="w-4" />
          <span>{{ $t('popup.search.text') }}</span>
        </button>
      </div>
      <div class="border-t border-[var(--radio-border)] pt-5">
        <p class="mb-3 px-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--radio-text-muted)]">{{ $t('player.explore') }}</p>
        <nav class="space-y-1" :aria-label="$t('sidebar.radio_regions')">
          <NuxtLink v-for="item in areas" :key="item.slug" :to="`/${item.slug}`"
            class="radio-interactive flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm transition"
            :class="route.path.startsWith(`/${item.slug}`) ? 'bg-rose-500/10 font-semibold text-rose-500' : 'text-[var(--radio-text-muted)] hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]'">
            <span class="min-w-0 truncate">{{ $t(`world.${item.key}.name`) }}</span>
            <span class="shrink-0 text-[11px] tabular-nums opacity-60">{{ item.count }}</span>
          </NuxtLink>
        </nav>
      </div>
      <div class="hidden rounded-2xl border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] p-4">
        <div class="mb-2 flex items-center gap-2 text-xs font-semibold text-rose-500">
          <span class="h-2 w-2 animate-pulse rounded-full bg-current" aria-hidden="true"></span>
          <span>{{ $t('sidebar.live_badge') }}</span>
        </div>
        <p class="text-sm leading-6 text-[var(--radio-text-muted)]">{{ $t('sidebar.description') }}</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import worldData from "~/data/world";

defineProps<{ mobile?: boolean }>();
const route = useRoute();
const areas = Object.entries(worldData).map(([key, countries]) => ({
  key,
  slug: key.replace(/_/g, "-"),
  count: Object.keys(countries).length,
}));
const focusSearch = () => {
  if (!import.meta.client) return;
  window.dispatchEvent(new CustomEvent("radio:open-search"));
};
</script>

