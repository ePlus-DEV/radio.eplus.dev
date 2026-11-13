<template>
  <!-- Content-only fallback: Library page already renders the heading and navigation. -->
  <section class="radio-library-content-skeleton space-y-4 sm:space-y-5"
    :role="announce ? 'status' : undefined"
    :aria-live="announce ? 'polite' : undefined"
    aria-busy="true">
    <span v-if="announce" class="sr-only">{{ $t('library.loading') }}</span>
    <div aria-hidden="true" class="space-y-4 sm:space-y-5">
      <!-- Overview: real summary counts, saved stations, then shortcuts. -->
      <template v-if="tab === 'all'">
        <div class="grid grid-cols-3 gap-2 sm:gap-3">
          <div v-for="i in 3" :key="'summary-' + i" class="radio-surface space-y-2 rounded-2xl p-4">
            <div class="radio-skeleton mx-auto h-5 w-5 rounded-lg" />
            <div class="radio-skeleton mx-auto h-7 w-12 rounded-lg" />
            <div class="radio-skeleton mx-auto h-3 w-4/5 rounded-md" />
          </div>
        </div>
        <div class="radio-surface space-y-4 rounded-2xl p-4 sm:p-5">
          <div v-for="group in ['favorites', 'recent']" :key="group" class="space-y-3">
            <div class="radio-skeleton h-6 w-44 rounded-lg" />
            <div class="grid gap-3 sm:grid-cols-2">
              <div v-for="i in 2" :key="group + i" class="radio-skeleton-card flex h-20 items-center gap-3 rounded-2xl border border-[var(--radio-border)] p-2">
                <div class="radio-skeleton h-12 w-12 shrink-0 rounded-xl" />
                <div class="radio-skeleton h-4 flex-1 rounded-md" />
                <div class="radio-skeleton h-10 w-10 shrink-0 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-3">
          <div v-for="i in 3" :key="'shortcut-' + i" class="radio-surface space-y-3 rounded-2xl p-4">
            <div class="radio-skeleton h-5 w-3/5 rounded-md" />
            <div class="radio-skeleton h-3 w-5/6 rounded-md" />
            <div class="radio-skeleton h-3 w-4/6 rounded-md" />
          </div>
        </div>
      </template>

      <template v-else-if="tab === 'collections' || tab === 'custom'">
        <div class="radio-surface space-y-4 rounded-2xl p-4 sm:p-5">
          <div class="radio-skeleton h-6 w-48 max-w-full rounded-lg" />
          <div class="radio-skeleton h-3 w-72 max-w-full rounded-md" />
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="radio-skeleton h-11 rounded-xl" />
            <div class="radio-skeleton h-11 rounded-xl" />
          </div>
          <div class="radio-skeleton h-11 w-32 rounded-xl" />
          <div class="radio-skeleton h-5 w-36 rounded-md" />
        </div>
      </template>

      <!-- Listening activity: KPI cards and chart. -->
      <template v-else-if="tab === 'stats'">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0 flex-1 space-y-2">
            <div class="radio-skeleton h-6 w-44 rounded-lg" />
            <div class="radio-skeleton h-3 w-3/5 rounded-md" />
          </div>
          <div class="radio-skeleton h-10 w-28 rounded-lg" />
        </div>
        <div class="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          <div v-for="i in 4" :key="'kpi-' + i" class="radio-skeleton-card space-y-3 rounded-xl border border-[var(--radio-border)] p-3.5">
            <div class="radio-skeleton h-3 w-4/5 rounded-md" />
            <div class="radio-skeleton h-7 w-3/5 rounded-lg" />
            <div class="radio-skeleton h-3 w-full rounded-md" />
          </div>
        </div>
        <div class="radio-surface space-y-4 rounded-2xl p-4 sm:p-5">
          <div class="radio-skeleton h-6 w-48 rounded-lg" />
          <div class="radio-skeleton h-40 w-full rounded-xl sm:h-44" />
          <div class="grid grid-cols-3 gap-3">
            <div v-for="i in 3" :key="'legend-' + i" class="radio-skeleton h-3 rounded-md" />
          </div>
        </div>
      </template>

      <!-- Favorites and recent station rows. -->
      <template v-else>
        <div v-if="tab === 'favorites'" class="flex flex-wrap gap-2">
          <div class="radio-skeleton h-11 w-28 rounded-lg" />
          <div class="radio-skeleton h-11 w-28 rounded-lg" />
        </div>
        <div class="radio-skeleton h-6 w-44 rounded-lg" />
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div v-for="i in 3" :key="i" class="radio-skeleton-card flex min-h-20 items-center gap-2 rounded-2xl border border-[var(--radio-border)] p-2 sm:gap-3">
            <div class="radio-skeleton h-12 w-12 shrink-0 rounded-xl" />
            <div class="radio-skeleton h-4 min-w-0 flex-1 rounded-md" />
            <div class="radio-skeleton h-10 w-10 shrink-0 rounded-full" />
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  tab?: 'all' | 'favorites' | 'recent' | 'collections' | 'custom' | 'stats';
  announce?: boolean;
}>(), {
  tab: 'all',
  announce: true,
});
</script>
