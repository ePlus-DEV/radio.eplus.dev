<template>
  <section class="radio-surface overflow-hidden">
    <div
      class="flex items-center justify-between gap-3 border-b border-[var(--radio-border)] px-4 py-4 sm:px-5"
    >
      <div class="min-w-0">
        <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">
          {{ $t("panel.play_from_radio") }}
        </p>
        <h2 class="mt-1 truncate text-lg font-semibold tracking-tight text-[var(--radio-text)] sm:text-xl">
          {{ countryName }}
        </h2>
      </div>
      <span
        class="inline-flex items-center rounded-full h-7 shrink-0 border-0 bg-[var(--radio-surface-soft)] px-2.5 text-xs font-medium tabular-nums text-[var(--radio-text-muted)]"
      >
        {{ stations.length }}
      </span>
    </div>

    <div
      v-if="stations.length"
      class="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:p-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    >
      <NuxtLink
        v-for="station in stations"
        :key="station.id"
        :to="station.url"
        class="radio-themed-soft group min-w-0 overflow-hidden rounded-2xl border transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5"
        :class="
          station.id === activeStationId
            ? 'border-rose-300 ring-2 ring-rose-500/15 dark:border-rose-400/40'
            : 'border-[var(--radio-border)] hover:border-rose-200 dark:hover:border-rose-400/30'
        "
        :title="station.title"
        :aria-label="station.title"
      >
        <div class="radio-themed-artwork relative flex aspect-[4/3] items-center justify-center overflow-hidden p-3">
          <img
            loading="lazy"
            :src="station.image"
            :alt="station.title"
            class="h-auto max-h-[66px] w-auto max-w-[96px] object-contain transition duration-200 group-hover:scale-[1.04]"
          />

          <span
            v-if="station.id === activeStationId"
            class="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm"
          >
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-white"></span>
            Live
          </span>

          <span
            class="absolute bottom-2 right-2 flex h-8 w-8 scale-90 items-center justify-center rounded-full bg-[var(--radio-inverse-bg)] text-[var(--radio-inverse-text)] opacity-0 shadow transition group-hover:scale-100 group-hover:opacity-100"
          >
            <fa :icon="['fas', 'play']" class="ml-0.5 h-3 w-3" />
          </span>
        </div>

        <div class="border-t border-[var(--radio-border)] px-3 py-3">
          <p
            dir="auto"
            class="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[var(--radio-text)]"
          >
            {{ station.title }}
          </p>
        </div>
      </NuxtLink>
    </div>

    <div
      v-else
      class="px-5 py-10 text-center text-sm text-[var(--radio-text-muted)]"
    >
      {{ $t("panel.updating") }}
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { RadioStationOption } from "~/types/radio";

withDefaults(
  defineProps<{
    stations?: RadioStationOption[];
    activeStationId?: string;
    countryName?: string;
  }>(),
  {
    stations: () => [],
    activeStationId: "",
    countryName: "",
  },
);
</script>
