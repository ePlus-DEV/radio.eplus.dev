<template>
  <section :aria-label="$t('home.featured')">
    <div
      class="radio-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4 2xl:grid-cols-5"
    >
      <article
        v-for="station in stations"
        :key="station.id"
        class="radio-featured-card group relative w-40 shrink-0 snap-start overflow-hidden rounded-2xl border border-[var(--radio-border)] bg-[var(--radio-surface)] transition duration-200 hover:-translate-y-0.5 hover:border-violet-400/50 hover:shadow-lg sm:w-auto"
        :class="station.id === activeStationId ? 'ring-2 ring-violet-500/40 border-violet-400/60' : ''"
      >
        <NuxtLink
          :to="station.url"
          class="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          :title="station.title"
          :aria-label="station.title"
        >
          <div class="radio-themed-artwork relative flex aspect-[5/4] items-center justify-center overflow-hidden p-5 sm:aspect-square">
            <img
              loading="lazy"
              :src="station.image"
              :alt="station.title"
              class="max-h-[75%] max-w-[85%] object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
            />
            <span
              v-if="station.id === activeStationId"
              class="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-violet-600 px-2 py-1 text-[10px] font-semibold text-white"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-white"></span> {{ $t(playback.playing ? 'player.on_air' : 'redesign.paused') }}
            </span>
          </div>
          <div class="px-3 py-3">
            <p dir="auto" class="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[var(--radio-text)]">{{ station.title }}</p>
          </div>
        </NuxtLink>
        <button
          type="button"
          class="absolute bottom-2 right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-violet-600 text-white shadow-md transition group-hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          :aria-label="$t('player.play') + ': ' + station.title"
          @click="emit('select-station', station)"
        >
          <UIcon name="i-lucide-play" class="h-4 w-4" />
        </button>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePlaybackStore } from '~/stores/playback';
const playback = usePlaybackStore();
import type { RadioStationOption } from '~/types/radio';

defineProps<{ stations: RadioStationOption[]; activeStationId?: string }>();
const emit = defineEmits<{ (event: 'select-station', station: RadioStationOption): void }>();
</script>
