<template>
  <aside class="hidden min-w-0 xl:block" aria-label="Browse radio">
    <div class="sticky top-28 max-h-[calc(100vh-8rem)] space-y-6 overflow-y-auto pb-8 pr-2 radio-scrollbar">
      <div class="space-y-1">
        <NuxtLink to="/" class="radio-interactive flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition"
          :class="route.path === '/' ? 'bg-rose-500/10 text-rose-500' : 'text-[var(--radio-text-muted)] hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]'">
          <fa :icon="['fas', 'house']" class="w-4" />
          <span>{{ $t('navmenu.homepage') }}</span>
        </NuxtLink>
        <button type="button" class="radio-interactive flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[var(--radio-text-muted)] transition hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]" @click="focusSearch">
          <fa :icon="['fas', 'magnifying-glass']" class="w-4" />
          <span>{{ $t('popup.search.text') }}</span>
        </button>
      </div>
      <div class="border-t border-[var(--radio-border)] pt-5">
        <p class="mb-3 px-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--radio-text-muted)]">Explore regions</p>
        <nav class="space-y-1" aria-label="Radio regions">
          <NuxtLink v-for="item in areas" :key="item.slug" :to="`/${item.slug}`"
            class="radio-interactive flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm transition"
            :class="route.path.startsWith(`/${item.slug}`) ? 'bg-rose-500/10 font-semibold text-rose-500' : 'text-[var(--radio-text-muted)] hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]'">
            <span class="min-w-0 truncate">{{ $t(`world.${item.key}.name`) }}</span>
            <span class="shrink-0 text-[11px] tabular-nums opacity-60">{{ item.count }}</span>
          </NuxtLink>
        </nav>
      </div>
      <div class="rounded-2xl border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] p-4">
        <div class="mb-2 flex items-center gap-2 text-xs font-semibold text-rose-500">
          <span class="h-2 w-2 animate-pulse rounded-full bg-current" aria-hidden="true"></span>
          <span>LIVE RADIO</span>
        </div>
        <p class="text-sm leading-6 text-[var(--radio-text-muted)]">Explore live stations around the world, any time.</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import worldData from "~/data/world";

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
