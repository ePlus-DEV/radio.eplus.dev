<template>
  <section class="radio-surface overflow-hidden">
    <div
      class="flex items-center justify-between gap-3 border-b border-[var(--radio-border)] px-4 py-4 sm:px-5"
    >
      <div class="min-w-0">
        <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">
          {{ $t(eyebrowKey) }}
        </p>
        <h2 class="mt-1 truncate text-lg font-semibold tracking-tight text-[var(--radio-text)] sm:text-xl">
          {{ countryName }}
        </h2>
      </div>
      <span
        class="radio-count-badge inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-xs font-semibold"
      >
        {{ stations.length }}
      </span>
    </div>

    <div
      v-if="stations.length"
      class="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 lg:grid-cols-4 2xl:grid-cols-5"
    >
      <article
        v-for="station in stations"
        :key="station.id"
        class="radio-station-card group radio-card-compact-station"
        :class="
          station.id === activeStationId
            ? 'radio-card-compact-station-active'
            : 'radio-card-compact-station-idle'
        "
      >
        <UTooltip :text="station.title">
          <NuxtLink
            :prefetch="false"
            :to="station.url"
            class="radio-card-compact-station-link"
            :aria-label="station.title"
          >
            <div class="radio-themed-artwork radio-card-compact-station-art">
              <img
                loading="lazy"
                decoding="async"
                :src="siteAssetUrl(station.image)"
                @error="handleArtworkError"
                :alt="station.title"
                class="radio-card-compact-station-img"
              />

              <span
                v-if="isPending(station) || isConnecting(station)"
                class="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm"
                role="status"
              >
                <UIcon name="i-lucide-loader-circle" class="h-3 w-3 animate-spin" aria-hidden="true" />
                {{ $t('player.connecting') }}
              </span>
              <span
                v-else-if="station.id === activeStationId"
                class="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm"
              >
                <span v-if="isPlaying(station)" class="h-1.5 w-1.5 animate-pulse rounded-full bg-white"></span>
                {{ $t(isPlaying(station) ? 'player.on_air' : 'redesign.paused') }}
              </span>
            </div>

            <div class="radio-card-compact-station-name">
              <span dir="auto" class="radio-card-compact-station-label">
                <CountryMarquee :text="station.title" />
              </span>
            </div>
          </NuxtLink>
        </UTooltip>
        <button
          type="button"
          class="radio-card-compact-station-play"
          :aria-label="$t(isPending(station) ? 'player.connecting' : isConnecting(station) ? 'player.stop_connecting' : isPlaying(station) ? 'player.pause' : 'player.play') + ': ' + station.title"
          :aria-pressed="isPlaying(station)"
          :aria-busy="isPending(station) || isConnecting(station)"
          :disabled="!playEnabled || isPending(station)"
          :title="!playEnabled ? disabledReason : undefined"
          @click="emit('select-station', station)"
        >
          <UIcon :name="isPending(station) || isConnecting(station) ? 'i-lucide-loader-circle' : isPlaying(station) ? 'i-lucide-pause' : 'i-lucide-play'"
            class="h-4 w-4" :class="isPending(station) || isConnecting(station) ? 'animate-spin' : isPlaying(station) ? '' : 'translate-x-px'" />
        </button>
      </article>
    </div>

    <div
      v-else
      class="px-5 py-10 text-center text-sm text-[var(--radio-text-muted)]"
    >
      {{ $t("panel.no_channels") }}
    </div>
  </section>
</template>

<script lang="ts" setup>
import { usePlaybackStore } from '~/stores/playback';
const playback = usePlaybackStore();
import type { RadioStationOption } from "~/types/radio";

const emit = defineEmits<{ (event: 'select-station', station: RadioStationOption): void }>();
const props = withDefaults(
  defineProps<{
    stations?: RadioStationOption[];
    activeStationId?: string;
    countryName?: string;
    /** Optional provider-specific heading; Country keeps its existing translation by default. */
    eyebrowKey?: string;
    /** Only the selected Global Radio card is busy while its stream resolves. */
    pendingStationId?: string;
    playEnabled?: boolean;
    disabledReason?: string;
  }>(),
  {
    stations: () => [],
    activeStationId: "",
    countryName: "",
    eyebrowKey: "panel.play_from_radio",
    pendingStationId: "",
    playEnabled: true,
    disabledReason: "",
  },
);
const isPending = (station: RadioStationOption): boolean =>
  station.id === props.pendingStationId;
const isConnecting = (station: RadioStationOption): boolean =>
  station.id === props.activeStationId && playback.status === 'connecting';
const isPlaying = (station: RadioStationOption): boolean =>
  station.id === props.activeStationId && playback.status === 'playing';


const siteAssetUrl = useSiteAssetUrl();
// Preserve Global Radio's existing local-artwork fallback and provide the same
// safeguard to Country without changing its normal image rendering.
const handleArtworkError = (event: Event): void => {
  const image = event.target as HTMLImageElement | null;
  if (!image) return;
  image.onerror = null;
  image.src = siteAssetUrl('/brand/onair-mark.svg');
};
</script>

