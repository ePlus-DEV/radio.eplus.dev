<template>
  <section v-show="!nowPlayingOpen" class="radio-player-dock fixed inset-x-0 bottom-0 z-[60] border-t border-[var(--radio-border)] bg-[var(--radio-surface-elevated)] shadow-[0_-12px_40px_-28px_rgba(15,23,42,0.4)]" :class="{ 'hidden': playerMini }" :aria-label="$t('player.title')">
    <div class="radio-player-inner mx-auto max-w-[1920px] px-3 sm:px-6">
      <div v-if="playerStatusVisible" class="sr-only" aria-live="polite">
        <template v-if="streamError">
          <span class="truncate text-rose-500">{{ $t('alert.stream_error') }}</span>
          <UButton size="xs" variant="link" class="shrink-0 p-0 text-[10px]" @click="retryCurrentSource">{{ $t('player.retry') }}</UButton>
        </template>
        <span v-else-if="!online">{{ $t('text.offline') }}</span>
        <span v-else-if="waiting" class="inline-flex items-center gap-1.5"><span class="h-1 w-1 animate-pulse rounded-full bg-rose-500"></span>{{ $t('player.connecting') }}</span>
        <span v-else-if="!hasPlayableSource">{{ $t('player.choose_station') }}</span>
        <span v-if="sleepRemaining" class="shrink-0 tabular-nums">· {{ $t('player.sleep_remaining', { minutes: sleepRemaining }) }}</span>
      </div>

      <div class="radio-player-console grid min-h-[64px] grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1.5 pb-2 sm:grid-cols-[minmax(0,0.95fr)_auto_minmax(0,0.95fr)] sm:gap-4">
        <div class="relative flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div class="radio-themed-artwork radio-player-artwork relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--radio-border)] p-1.5 sm:h-14 sm:w-14">
            <img v-if="nowPlayingArtwork" :src="nowPlayingArtwork" :alt="nowPlayingTitle" class="max-h-full max-w-full object-contain" />
            <UIcon v-else name="i-lucide-radio" class="h-5 w-5 text-[var(--radio-text-muted)]" />
            <span v-if="playing" class="absolute bottom-1 right-1 flex h-4 w-4 items-end justify-center gap-px rounded-full bg-[var(--radio-inverse-bg)] pb-1 text-[var(--radio-inverse-text)]" aria-hidden="true">
              <span class="radio-bar is-playing h-1 w-px bg-current"></span><span class="radio-bar is-playing h-2 w-px bg-current"></span><span class="radio-bar is-playing h-1.5 w-px bg-current"></span>
            </span>
          </div>
          <button type="button" class="absolute inset-0 z-10 rounded-xl sm:hidden" :aria-label="$t('redesign.now_playing')" @click="nowPlayingOpen = true"></button>
          <div class="min-w-0 flex-1">
            <div class="mb-1 hidden items-center gap-2 sm:flex">
              <span class="radio-player-live-pill inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" :class="liveStateClass">
                <span class="h-1.5 w-1.5 rounded-full" :class="playing ? 'animate-pulse bg-emerald-500' : waiting ? 'animate-pulse bg-amber-500' : streamError ? 'bg-rose-500' : 'bg-current'"></span>
                {{ liveStateLabel }}
              </span>
            </div>
            <UTooltip :text="nowPlayingTitle">
              <p dir="auto" class="radio-player-title text-xs font-semibold sm:text-sm" :class="{ 'radio-player-title-marquee': nowPlayingTitleMarquee }">
                <span>{{ nowPlayingTitle }}</span>
              </p>
            </UTooltip>
            <p v-if="nowPlayingArtist" dir="auto" class="radio-player-meta mt-0.5 truncate text-[10px] text-[var(--radio-text-muted)] sm:text-xs">{{ nowPlayingArtist }}</p>
            <p v-else class="radio-player-meta radio-player-meta-placeholder mt-0.5 text-[10px] sm:text-xs">&nbsp;</p>
            <NuxtLink v-if="stationUrl" :to="stationUrl" dir="auto" class="radio-player-meta mt-1 block truncate text-[10px] text-[var(--radio-text-muted)] hover:text-rose-500 sm:text-xs">{{ streamName }} · {{ countryName || $t(country) }}</NuxtLink>
            <p v-else class="radio-player-meta mt-1 text-[10px] sm:text-xs">&nbsp;</p>
          </div>
        </div>

        <div class="radio-player-controls z-20 flex items-center justify-center gap-0.5 sm:gap-2">
          <UTooltip v-if="canNavigateStations" :text="previousStationLabel">
            <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-skip-back" class="inline-flex h-10 w-10 cursor-pointer justify-center rounded-full sm:h-11 sm:w-11" :aria-label="previousStationLabel" @click="navigateStation(-1)" />
          </UTooltip>
          <UButton class="radio-player-main-action h-11 w-11 cursor-pointer justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-950/25 ring-4 ring-rose-500/10 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:w-12" :disabled="!hasPlayableSource" :aria-label="playing || waiting ? $t('player.pause') : $t('player.play')" @click="playing || waiting ? onPause() : onPlay()">
            <UIcon v-if="waiting" name="i-lucide-loader-circle" class="h-5 w-5 animate-spin" />
            <UIcon v-else :name="playing ? 'i-lucide-pause' : 'i-lucide-play'" class="h-5 w-5" />
          </UButton>
          <UTooltip v-if="canNavigateStations" :text="nextStationLabel">
            <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-skip-forward" class="h-10 w-10 cursor-pointer justify-center rounded-full sm:h-11 sm:w-11" :aria-label="nextStationLabel" @click="navigateStation(1)" />
          </UTooltip>
        </div>

        <div class="flex items-center justify-end sm:hidden">
          <UButton v-if="hasSidebar" color="neutral" variant="ghost" size="sm" icon="i-lucide-list-music" class="h-10 w-10 cursor-pointer justify-center rounded-full" :aria-label="$t('player.queue')" :aria-expanded="mobileQueueOpen" @click="toggleQueue" />
        </div>

        <div class="hidden min-w-0 items-center justify-end gap-1 sm:flex">
          <UButton color="neutral" variant="ghost" icon="i-lucide-maximize-2" class="h-11 w-11 shrink-0 cursor-pointer justify-center rounded-full" :aria-label="$t('redesign.now_playing')" @click="nowPlayingOpen = true" />
          <UButton color="neutral" :variant="favoriteActive ? 'soft' : 'ghost'" icon="i-lucide-heart" class="h-11 w-11 shrink-0 cursor-pointer justify-center rounded-full" :class="favoriteActive ? 'text-rose-500' : ''" :disabled="!stationUrl" :aria-pressed="favoriteActive" :aria-label="$t(favoriteActive ? 'library.remove_favorite' : 'library.add_favorite')" @click="toggleFavorite" />

          <UDropdownMenu :items="sleepMenuItems" :content="{ align: 'end', side: 'top' }" :modal="false">
            <UTooltip :text="$t('player.sleep_timer')">
              <UButton color="neutral" :variant="sleepRemaining ? 'soft' : 'ghost'" icon="i-lucide-timer" class="h-11 min-w-11 cursor-pointer justify-center rounded-full" :disabled="!hasPlayableSource" :aria-label="$t('player.sleep_timer')" />
            </UTooltip>
          </UDropdownMenu>

          <UDropdownMenu v-if="sourceList.length > 1" :items="sourceMenuItems" :content="{ align: 'end', side: 'top' }" :modal="false" :ui="{ content: 'w-72' }">
            <UButton color="neutral" variant="soft" size="xs" icon="i-lucide-radio-tower" :aria-label="$t('player.source')" class="hidden max-w-36 cursor-pointer truncate rounded-full lg:inline-flex">{{ activeSourceName }}</UButton>
          </UDropdownMenu>
          <UButton v-else color="neutral" variant="soft" size="xs" icon="i-lucide-radio-tower" :aria-label="$t('player.source')" class="hidden max-w-36 truncate rounded-full lg:inline-flex">{{ activeSourceName }}</UButton>
          <UButton color="neutral" variant="ghost" size="sm" class="cursor-pointer rounded-full" :icon="muted || volume === 0 ? 'i-lucide-volume-x' : 'i-lucide-volume-2'" :aria-label="muted || volume === 0 ? $t('player.unmute') : $t('player.mute')" @click="toggleMute" />
          <input type="range" min="0" max="1" step="0.01" :value="muted ? 0 : volume" @input="onVolumeInput" :aria-label="$t('player.volume')" class="radio-volume hidden h-1 w-20 cursor-pointer appearance-none rounded-full bg-[var(--radio-track)] md:block xl:w-24" />
          <UButton v-if="lyricsAvailable" color="neutral" variant="ghost" size="sm" icon="i-lucide-mic-vocal" class="cursor-pointer rounded-full" :aria-label="$t('panel.lyric')" @click="$emit('open-lyrics')" />
          <UButton v-if="hasSidebar" color="neutral" variant="soft" size="sm" class="relative cursor-pointer rounded-full" icon="i-lucide-list-music" :aria-label="$t('player.queue')" :aria-expanded="wideViewport ? playback.queueOpen : mobileQueueOpen" @click="toggleQueue">
            <span v-if="sidebarCount" class="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-4 text-white">{{ sidebarCount }}</span>
          </UButton>
          <UTooltip :text="$t('player.window_player')">
            <UButton color="neutral" variant="ghost" size="sm" class="cursor-pointer rounded-full" icon="i-lucide-picture-in-picture-2" :aria-label="$t('player.window_player')" @click="setPlayerMini(true)" />
          </UTooltip>
        </div>
      </div>
    </div>
    <div class="radio-audio-host" aria-hidden="true"><audio ref="mediaElement" playsinline preload="none"></audio></div>
  </section>

  <section v-show="!nowPlayingOpen && playerMini" class="radio-player-mini fixed bottom-5 right-5 z-[70] w-[min(22rem,calc(100vw-2rem))] rounded-3xl border border-[var(--radio-border)] bg-[var(--radio-surface-elevated)] p-3 shadow-2xl shadow-black/40" :aria-label="$t('player.window_player')">
    <div class="flex items-center gap-3">
      <div class="radio-themed-artwork relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--radio-border)] p-1.5">
        <img v-if="nowPlayingArtwork" :src="nowPlayingArtwork" :alt="nowPlayingTitle" class="max-h-full max-w-full object-contain" />
        <UIcon v-else name="i-lucide-radio" class="h-6 w-6 text-[var(--radio-text-muted)]" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-500">
          <span class="h-1.5 w-1.5 rounded-full" :class="playing ? 'animate-pulse bg-emerald-500' : 'bg-current'"></span>
          {{ liveStateLabel }}
        </p>
        <p dir="auto" class="mt-1 truncate text-sm font-semibold">{{ nowPlayingTitle }}</p>
        <p v-if="nowPlayingArtist" dir="auto" class="truncate text-xs text-[var(--radio-text-muted)]">{{ nowPlayingArtist }}</p>
      </div>
      <UButton class="h-12 w-12 cursor-pointer justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-950/25 hover:bg-rose-400" :disabled="!hasPlayableSource" :aria-label="playing || waiting ? $t('player.pause') : $t('player.play')" @click="playing || waiting ? onPause() : onPlay()">
        <UIcon v-if="waiting" name="i-lucide-loader-circle" class="h-5 w-5 animate-spin" />
        <UIcon v-else :name="playing ? 'i-lucide-pause' : 'i-lucide-play'" class="h-5 w-5" />
      </UButton>
    </div>
    <div class="mt-3 flex items-center justify-between gap-1">
      <div class="flex items-center gap-1">
        <UButton v-if="canNavigateStations" color="neutral" variant="ghost" size="sm" icon="i-lucide-skip-back" class="cursor-pointer rounded-full" :aria-label="previousStationLabel" @click="navigateStation(-1)" />
        <UButton v-if="canNavigateStations" color="neutral" variant="ghost" size="sm" icon="i-lucide-skip-forward" class="cursor-pointer rounded-full" :aria-label="nextStationLabel" @click="navigateStation(1)" />
        <UButton color="neutral" variant="ghost" size="sm" :icon="muted || volume === 0 ? 'i-lucide-volume-x' : 'i-lucide-volume-2'" class="cursor-pointer rounded-full" :aria-label="muted || volume === 0 ? $t('player.unmute') : $t('player.mute')" @click="toggleMute" />
      </div>
      <div class="flex items-center gap-1">
        <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-maximize-2" class="cursor-pointer rounded-full" :aria-label="$t('redesign.now_playing')" @click="nowPlayingOpen = true" />
        <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-panel-bottom" class="cursor-pointer rounded-full" :aria-label="$t('player.dock_player')" @click="setPlayerMini(false)" />
      </div>
    </div>
  </section>

  <Teleport to="#radio-queue-slot">
    <aside v-if="hasSidebar" v-show="playback.queueOpen" class="radio-right-panel sticky z-30 flex w-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--radio-border)] bg-[var(--radio-surface)]" :aria-label="$t('player.queue')">
      <div class="flex items-center justify-between border-b border-[var(--radio-border)] p-4">
        <div class="min-w-0"><p class="text-xs font-semibold">{{ $t('player.queue') }}</p><p dir="auto" class="mt-1 truncate text-[11px] text-[var(--radio-text-muted)]">{{ streamName }}</p></div>
        <UButton color="neutral" variant="ghost" size="xs" icon="i-lucide-panel-right-close" :aria-label="$t('button.close')" @click="setQueueOpen(false)" />
      </div>
      <div v-if="song?.nextMedia?.title" class="border-b border-[var(--radio-border)] p-4">
        <p class="mb-2 text-[10px] font-semibold uppercase tracking-wider text-rose-500">{{ $t("panel.next") }}</p>
        <p dir="auto" class="truncate text-sm font-semibold">{{ song.nextMedia.title }}</p>
        <p dir="auto" class="mt-1 truncate text-xs text-[var(--radio-text-muted)]">{{ song.nextMedia.artists }}</p>
      </div>
      <PlayerQueue class="min-h-0 flex-1" :playlist="playlist || []" :program="program || []" :stations="stations || []" :active-station-id="activeStationId" :country-name="countryName || $t(country)" :schedule-loading="queueLoading" :thumb="thumb" :station-name="streamName" @select-station="selectStation" />
    </aside>
  </Teleport>

  <USlideover v-model:open="mobileQueueOpen" :title="$t('player.queue')" :description="streamName" :ui="{ content: 'w-full max-w-sm', body: 'flex min-h-0 flex-1 flex-col p-0 sm:p-0' }">
    <template #body>
      <div class="flex flex-wrap items-center gap-2 border-b border-[var(--radio-border)] p-3">
        <UButton color="neutral" variant="soft" icon="i-lucide-heart" class="min-h-11" :class="favoriteActive ? 'text-rose-500' : ''" :disabled="!stationUrl" :aria-pressed="favoriteActive" @click="toggleFavorite">{{ $t(favoriteActive ? 'library.remove_favorite' : 'library.add_favorite') }}</UButton>
        <div class="flex min-w-[10rem] flex-1 items-center gap-2">
          <UButton color="neutral" variant="soft" size="xs" class="shrink-0" :icon="muted ? 'i-lucide-volume-x' : 'i-lucide-volume-2'" :aria-label="muted ? $t('player.unmute') : $t('player.mute')" @click="toggleMute">{{ muted ? $t('player.unmute') : $t('player.mute') }}</UButton>
          <input v-if="!systemVolumeOnly" type="range" min="0" max="1" step="0.01" :value="muted ? 0 : volume" @input="onVolumeInput" :aria-label="$t('player.volume')" class="radio-volume radio-volume-mobile h-11 min-w-0 flex-1 cursor-pointer appearance-none bg-transparent" />
        </div>
        <UDropdownMenu :items="sleepMenuItems" :content="{ align: 'end' }">
          <UButton color="neutral" variant="soft" icon="i-lucide-timer" class="min-h-11" :disabled="!hasPlayableSource">{{ $t('player.sleep_timer') }}</UButton>
        </UDropdownMenu>
        <UDropdownMenu v-if="sourceList.length > 1" :items="sourceMenuItems" :content="{ align: 'end' }" :ui="{ content: 'w-64' }">
          <UButton color="neutral" variant="soft" size="xs" icon="i-lucide-radio-tower">{{ $t('player.source') }}</UButton>
        </UDropdownMenu>
        <UButton v-if="lyricsAvailable" color="neutral" variant="soft" size="xs" icon="i-lucide-mic-vocal" @click="mobileQueueOpen = false; $emit('open-lyrics')">{{ $t('panel.lyric') }}</UButton>
        <p v-if="systemVolumeOnly" role="note" class="w-full text-xs leading-5 text-[var(--radio-text-muted)]">{{ $t('player.ios_volume_hint') }}</p>
      </div>
      <div v-if="song?.nextMedia?.title" class="border-b border-[var(--radio-border)] p-4">
        <p class="text-[10px] font-semibold uppercase tracking-wider text-rose-500">{{ $t('panel.next') }}</p>
        <p dir="auto" class="mt-2 truncate text-sm">{{ song.nextMedia.title }}</p>
      </div>
      <PlayerQueue class="min-h-0 flex-1" :playlist="playlist || []" :program="program || []" :stations="stations || []" :active-station-id="activeStationId" :country-name="countryName || $t(country)" :schedule-loading="queueLoading" :thumb="thumb" :station-name="streamName" @select-station="selectStation" />
    </template>
  </USlideover>
  <UModal v-model:open="nowPlayingOpen" fullscreen :title="$t('redesign.now_playing')" :ui="{ content: 'bg-[var(--radio-page-bg)]' }" @after:leave="finishPlayerAction">
    <template #content>
      <PlayerNowPlaying :title="nowPlayingTitle" :artist="nowPlayingArtist" :artwork="nowPlayingArtwork" :station-name="streamName" :status="playerStatus" :playing="playing" :waiting="waiting" :playable="hasPlayableSource" :favorite="favoriteActive" :error="streamError" :can-navigate="canNavigateStations" :previous-label="previousStationLabel" :next-label="nextStationLabel" :sleep-remaining="sleepRemaining" :sleep-items="sleepMenuItems" :source-items="sourceMenuItems" :lyrics-available="lyricsAvailable" :next-title="song?.nextMedia?.title" :next-artist="song?.nextMedia?.artists" :next-station-title="nextStation?.title" @close="nowPlayingOpen = false" @favorite="toggleFavorite" @previous="navigateStation(-1)" @next="navigateStation(1)" @toggle="playing || waiting ? onPause() : onPlay()" @retry="retryCurrentSource" @queue="deferPlayerAction('queue')" @lyrics="deferPlayerAction('lyrics')" />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { useListeningStore } from "~/stores/listening";
import { usePlaybackStore } from "~/stores/playback";
import { usesSystemVolumeControls } from "~/utils/mobile-volume.mjs";
import type { RadioSource, RadioStationOption } from "~/types/radio";
import {
  MAX_STREAM_ATTEMPTS,
  buildPlaybackSources,
  nextPlaybackIndex,
} from "~/utils/radio-source-plan.mjs";
import { getAdjacentStation } from "~/utils/station-navigation.mjs";
import { createSleepTimer } from "~/utils/sleep-timer.mjs";
import { buildRadioMediaMetadata } from "~/utils/radio-media-session.mjs";

interface CurrentMedia {
  title: string;
  artists: string;
  hasLyric?: boolean;
  encodeId: string;
  thumbnail?: string;
}

interface Song {
  encodeId: string;
  currentMedia?: CurrentMedia;
  nextMedia?: CurrentMedia;
  thumbnail?: string;
}

interface PlaylistItem {
  track_title: string;
  track_artist: string;
  track_image: string;
  track_played: number;
}

interface ProgramItem {
  startTime?: number;
  endTime?: number;
  title?: string;
  description?: string;
  encodeId?: string;
}

const props = defineProps<{
  thumb: string;
  streamName: string;
  country: string;
  program?: ProgramItem[];
  streamUrl: RadioSource;
  streamUrls?: RadioSource[];
  song?: Song;
  playlist?: PlaylistItem[];
  stations?: RadioStationOption[];
  activeStationId?: string;
  countryName?: string;
  queueLoading?: boolean;
  stationUrl?: string;
  lyricsAvailable?: boolean;
  playRequest?: number;
  pauseRequest?: number;
}>();

const emit = defineEmits<{
  (event: "select-station", station: RadioStationOption): void;
  (event: "open-lyrics"): void;
}>();

const $store = useMainStore();
const playback = usePlaybackStore();
const listening = useListeningStore();
listening.hydrate();
const PLAYER_QUEUE_OPEN_KEY = 'radio:player-queue-open';
const favoriteActive = computed(() => listening.library.favorites.some((item: { url: string }) => item.url === props.stationUrl));
const toggleFavorite = () => { if (playback.station) listening.toggleFavorite(playback.station); };
const { t } = useI18n();
const nowPlayingOpen = ref(false);
const playerStatus = computed(() => t(streamError.value ? 'alert.stream_error' : !online.value ? 'text.offline' : waiting.value ? 'player.connecting' : playing.value ? 'player.on_air' : 'redesign.paused'));
const liveStateLabel = computed(() => t(streamError.value ? 'alert.stream_error' : !online.value ? 'text.offline' : waiting.value ? 'player.connecting' : playing.value ? 'player.on_air' : 'player.ready'));
const liveStateClass = computed(() => {
  if (streamError.value) return "bg-rose-500/10 text-rose-500";
  if (!online.value || !hasPlayableSource.value) return "bg-[var(--radio-surface-soft)] text-[var(--radio-text-muted)]";
  if (waiting.value) return "bg-amber-500/10 text-amber-500";
  if (playing.value) return "bg-emerald-500/10 text-emerald-500";
  return "bg-rose-500/10 text-rose-400";
});
let pendingPlayerAction: 'queue' | 'lyrics' | null = null;
const deferPlayerAction = (action: 'queue' | 'lyrics') => { pendingPlayerAction = action; nowPlayingOpen.value = false; };
const finishPlayerAction = () => { const action = pendingPlayerAction; pendingPlayerAction = null; if (action === 'queue') { if (wideViewport.value) setQueueOpen(true); else mobileQueueOpen.value = true; } else if (action === 'lyrics') emit('open-lyrics'); };
const wideViewport = ref(false);
const updateViewport = () => { wideViewport.value = window.innerWidth >= 1536; if (wideViewport.value) mobileQueueOpen.value = false; };
const persistQueueOpen = (): void => {
  if (import.meta.client) localStorage.setItem(PLAYER_QUEUE_OPEN_KEY, playback.queueOpen ? '1' : '0');
};
const setQueueOpen = (value: boolean): void => {
  playback.queueOpen = value;
  persistQueueOpen();
};
const toggleQueue = () => { if (wideViewport.value) setQueueOpen(!playback.queueOpen); else mobileQueueOpen.value = !mobileQueueOpen.value; };
const runtimeConfig = useRuntimeConfig();
const mediaElement = ref<HTMLAudioElement | null>(null);
const online = ref(true);
const waiting = ref(false);
const playing = ref(false);
const streamError = ref(false);
const activeSourceIndex = ref(0);
const pendingAutoPlay = ref(false);
const userPaused = ref(true);
const attemptCount = ref(0);
const volume = ref(1);
const muted = ref(false);
// iOS browsers reserve playback volume for the hardware/system controls.
const systemVolumeOnly = ref(false);
const mobileQueueOpen = ref(false);
const playerCompact = ref(false);
const playerMini = ref(false);
const playerStatusVisible = computed(() => streamError.value || !online.value || waiting.value || !hasPlayableSource.value || Boolean(sleepRemaining.value));
const togglePlayerCompact = (): void => {
  playerCompact.value = !playerCompact.value;
  if (import.meta.client) localStorage.setItem('radio:player-compact', playerCompact.value ? '1' : '0');
};
const setPlayerMini = (value: boolean): void => {
  playerMini.value = value;
  if (value) {
    setQueueOpen(false);
    mobileQueueOpen.value = false;
  }
  if (import.meta.client) localStorage.setItem('radio:player-mini', value ? '1' : '0');
};

let hlsInstance: any = null;
let HlsCtor: any = null;
let hlsImportPromise: Promise<any> | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let fallbackProbeTimer: ReturnType<typeof setTimeout> | null = null;
let sourceVersion = 0;
let playVersion = 0;
let activeResolvedSrc = "";
let removeAutoPlayUnlockListeners: (() => void) | null = null;

const RECONNECT_BASE_DELAY = 1200;
const FALLBACK_PROBE_TIMEOUT = 10_000;

let hlsNetworkRecoveryCount = 0;
let hlsMediaRecoveryCount = 0;

const sourceList = computed<RadioSource[]>(() => {
  const candidates =
    Array.isArray(props.streamUrls) && props.streamUrls.length
      ? props.streamUrls
      : [props.streamUrl];

  return buildPlaybackSources(
    candidates.filter(
      (source): source is RadioSource =>
        Boolean(source && String(source.src || "").trim()),
    ),
    runtimeConfig.public.corsServer,
  ) as RadioSource[];
});

const hasPlayableSource = computed(() => sourceList.value.length > 0);

const sourceName = (source: RadioSource, index: number): string => {
  if (source.label?.trim()) return source.label.trim();

  const sourceKey = String(source.source || "").trim().toLowerCase();
  if (sourceKey === "primary" || index === 0) return t('player.primary_source');
  if (sourceKey.includes("alternative")) return t('player.alternative_source');
  if (sourceKey) {
    return sourceKey
      .split(/[-_]/g)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  return t('player.source_number', { number: index + 1 });
};

const sourceFormat = (source: RadioSource): string => {
  const type = String(source.type || "").toLowerCase();
  const src = source.src.toLowerCase();

  if (type.includes("mpegurl") || /\.m3u8(?:$|[?#])/i.test(src)) return "HLS";
  if (type.includes("aac") || /\.aac(?:$|[?#])/i.test(src)) return "AAC";
  if (type.includes("ogg") || /\.ogg(?:$|[?#])/i.test(src)) return "OGG";
  if (type.includes("opus") || /\.opus(?:$|[?#])/i.test(src)) return "OPUS";
  if (type.includes("mpeg") || /\.mp3(?:$|[?#])/i.test(src)) return "MP3";
  if (/\.pls(?:$|[?#])/i.test(src)) return "PLS";
  if (/\.m3u(?:$|[?#])/i.test(src)) return "M3U";

  return t('player.stream_format');
};

const sourceHost = (source: RadioSource): string => {
  try {
    return new URL(source.src).hostname.replace(/^www\./, "");
  } catch {
    return source.proxied ? t('player.proxy') : t('player.direct');
  }
};

const sourceMenuItems = computed(() => sourceList.value.map((source, index) => ({
  label: `${index + 1}. ${sourceName(source, index)} · ${sourceFormat(source)}`,
  description: source.proxied ? t('player.proxy') : sourceHost(source),
  type: 'checkbox' as const,
  checked: index === activeSourceIndex.value,
  onSelect: () => selectSource(index),
})));

const activeSourceName = computed(() =>
  sourceName(
    sourceList.value[activeSourceIndex.value] || props.streamUrl,
    activeSourceIndex.value,
  ),
);

const scheduleCount = computed(
  () => (props.playlist?.length || 0) + (props.program?.length || 0),
);
const stationList = computed<RadioStationOption[]>(() => props.stations || []);
const stationCount = computed(() => stationList.value.length);
const canNavigateStations = computed(() => stationCount.value > 1);
const adjacentStation = (offset: -1 | 1): RadioStationOption | undefined =>
  getAdjacentStation(
    stationList.value,
    props.activeStationId,
    offset,
  ) as RadioStationOption | undefined;

const previousStation = computed(() => adjacentStation(-1));
const nextStation = computed(() => adjacentStation(1));
const previousStationLabel = computed(() =>
  previousStation.value
    ? t("player.previous", { name: previousStation.value.title })
    : "Previous station",
);
const nextStationLabel = computed(() =>
  nextStation.value
    ? t("player.next", { name: nextStation.value.title })
    : "Next station",
);

const hasSidebar = computed(
  () => stationCount.value > 0 || scheduleCount.value > 0,
);
const sidebarCount = computed(
  () => stationCount.value || scheduleCount.value,
);

const nowPlayingTitle = computed(() => {
  const songTitle = props.song?.currentMedia?.title?.trim();
  if (songTitle) return songTitle;

  const playlistTitle = props.playlist?.[0]?.track_title?.trim();
  if (playlistTitle) return playlistTitle;

  return props.streamName || "Live radio";
});
const nowPlayingTitleMarquee = computed(() => nowPlayingTitle.value.length > 24);

const nowPlayingArtist = computed(() => {
  const songArtist = props.song?.currentMedia?.artists?.trim();
  if (songArtist) return songArtist;

  const playlistArtist = props.playlist?.[0]?.track_artist?.trim();
  if (playlistArtist) return playlistArtist;

  return "";
});

const nowPlayingArtwork = computed(
  () =>
    props.song?.currentMedia?.thumbnail ||
    props.song?.thumbnail ||
    props.playlist?.[0]?.track_image ||
    props.thumb,
);

const inferMime = (url: string, fallback = "audio/mpeg"): string => {
  const value = url.toLowerCase();
  if (/\.m3u8(?:$|[?#])/i.test(value)) return "application/vnd.apple.mpegurl";
  if (/\.aac(?:$|[?#])/i.test(value)) return "audio/aac";
  if (/\.ogg(?:$|[?#])/i.test(value)) return "audio/ogg";
  if (/\.opus(?:$|[?#])/i.test(value)) return "audio/opus";
  if (/\.mp3(?:$|[?#])/i.test(value)) return "audio/mpeg";
  return fallback || "audio/mpeg";
};

const isHlsSource = (source: RadioSource): boolean => {
  const type = String(source.type || "").toLowerCase();
  return (
    /\.m3u8(?:$|[?#])/i.test(source.src) ||
    type.includes("mpegurl") ||
    type.includes("m3u8")
  );
};

const isTextPlaylist = (url: string): boolean =>
  /\.pls(?:$|[?#])/i.test(url) ||
  /(?:[?&](?:output|format)=pls(?:&|$))/i.test(url) ||
  /\.m3u(?:$|[?#])/i.test(url);

const parsePlaylistUrls = (text: string): string[] => {
  const urls = new Set<string>();

  for (const line of text.split(/\r?\n/)) {
    const value = line.trim();
    if (!value || value.startsWith("#")) continue;

    const plsMatch = value.match(/^File\d+\s*=\s*(https?:\/\/.+)$/i);
    const candidate = plsMatch?.[1]?.trim() || value;

    if (/^https?:\/\//i.test(candidate)) {
      urls.add(candidate);
    }
  }

  return [...urls];
};

const resolvePlaylistSource = async (
  source: RadioSource,
): Promise<RadioSource> => {
  if (!isTextPlaylist(source.src)) return source;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(source.src, {
      signal: controller.signal,
      headers: { accept: "audio/x-scpls,audio/x-mpegurl,text/plain,*/*" },
    });
    if (!response.ok) return source;

    const urls = parsePlaylistUrls(await response.text());
    const first = urls[0];
    if (!first) return source;

    return {
      src: first,
      type: inferMime(first, source.type),
    };
  } catch {
    return source;
  } finally {
    clearTimeout(timer);
  }
};

const ensureHls = async (): Promise<any> => {
  if (HlsCtor) return HlsCtor;

  hlsImportPromise ||= import("hls.js").then((module) => {
    HlsCtor = module.default;
    return HlsCtor;
  });

  return await hlsImportPromise;
};

const destroyHls = (): void => {
  if (!hlsInstance) return;
  hlsInstance.destroy();
  hlsInstance = null;
  hlsNetworkRecoveryCount = 0;
  hlsMediaRecoveryCount = 0;
};

const clearReconnectTimer = (): void => {
  if (!reconnectTimer) return;
  clearTimeout(reconnectTimer);
  reconnectTimer = null;
};

const clearFallbackProbeTimer = (): void => {
  if (!fallbackProbeTimer) return;
  clearTimeout(fallbackProbeTimer);
  fallbackProbeTimer = null;
};

const registerAutoPlayUnlock = (): void => {
  if (!import.meta.client || removeAutoPlayUnlockListeners) return;

  const unlock = () => {
    removeAutoPlayUnlockListeners?.();
    removeAutoPlayUnlockListeners = null;
    void onPlay();
  };

  const events = ["pointerdown", "keydown", "touchstart"];
  events.forEach((eventName) => {
    window.addEventListener(eventName, unlock, { once: true });
  });

  removeAutoPlayUnlockListeners = () => {
    events.forEach((eventName) => {
      window.removeEventListener(eventName, unlock);
    });
  };
};

const tryPlay = async (): Promise<void> => {
  const media = mediaElement.value;
  if (!media || userPaused.value) return;
  const version = sourceVersion;
  const request = ++playVersion;

  waiting.value = true;

  try {
    await media.play();
    if (version !== sourceVersion || request !== playVersion || userPaused.value) return;
    pendingAutoPlay.value = false;
    waiting.value = false;
    playing.value = true;
    streamError.value = false;

  } catch (error) {
    if (version !== sourceVersion || request !== playVersion || userPaused.value) return;
    waiting.value = false;
    playing.value = false;

    const name =
      error && typeof error === "object" && "name" in error
        ? String((error as { name?: string }).name || "")
        : "";

    if (name === "NotAllowedError") {
      pendingAutoPlay.value = true;
      registerAutoPlayUnlock();
      return;
    }

    if (
      name === "AbortError" ||
      (hlsInstance && name === "NotSupportedError" && media.readyState === 0)
    ) {
      pendingAutoPlay.value = true;
      waiting.value = true;
      startFallbackProbe();
      return;
    }

    scheduleReconnect();
  }
};

const startFallbackProbe = (): void => {
  clearFallbackProbeTimer();

  if (
    activeSourceIndex.value + 1 >= sourceList.value.length ||
    userPaused.value
  ) {
    return;
  }

  fallbackProbeTimer = setTimeout(() => {
    fallbackProbeTimer = null;

    if (!playing.value && pendingAutoPlay.value && !userPaused.value) {
      advanceFallbackSource();
    }
  }, FALLBACK_PROBE_TIMEOUT);
};

const configureNativeSource = (
  source: RadioSource,
  autoplay: boolean,
): void => {
  const media = mediaElement.value;
  if (!media) return;

  destroyHls();
  media.src = source.src;
  media.load();

  if (autoplay && !userPaused.value) {
    startFallbackProbe();
    void tryPlay();
  }
};

const configureHlsSource = async (
  source: RadioSource,
  autoplay: boolean,
  version: number,
): Promise<void> => {
  const media = mediaElement.value;
  if (!media) return;

  destroyHls();

  // Prefer hls.js anywhere Media Source Extensions are available. Modern
  // Chromium can report native HLS support via canPlayType("...mpegurl")
  // while still failing on some manifests. Native HLS is the fallback for
  // browsers where hls.js/MSE is unavailable (notably Safari/iOS cases).
  const Hls = await ensureHls();
  if (version !== sourceVersion || !mediaElement.value) return;

  if (!Hls.isSupported()) {
    const nativeHls =
      media.canPlayType("application/vnd.apple.mpegurl") ||
      media.canPlayType("application/x-mpegURL");

    if (!nativeHls) {
      scheduleReconnect();
      return;
    }

    media.src = source.src;
    media.load();

    if (autoplay && !userPaused.value) {
      startFallbackProbe();
      media.addEventListener(
        "loadedmetadata",
        () => {
          if (version !== sourceVersion || userPaused.value) return;
          void tryPlay();
        },
        { once: true },
      );
    }
    return;
  }

  hlsInstance = new Hls();
  hlsInstance.on(Hls.Events.MEDIA_ATTACHED, () => {
    if (version !== sourceVersion || !hlsInstance) return;
    hlsInstance.loadSource(source.src);
  });

  hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
    if (version !== sourceVersion) return;

    clearReconnectTimer();
    streamError.value = false;

    if (autoplay && !userPaused.value) {
      startFallbackProbe();
      void tryPlay();
    }
  });

  hlsInstance.on(Hls.Events.ERROR, (_event: unknown, data: any) => {
    if (version !== sourceVersion || !data?.fatal || !hlsInstance) return;

    waiting.value = false;
    playing.value = false;

    if (
      data.type === Hls.ErrorTypes.NETWORK_ERROR &&
      hlsNetworkRecoveryCount < 1
    ) {
      hlsNetworkRecoveryCount += 1;
      waiting.value = true;
      hlsInstance.startLoad();
      startFallbackProbe();
      return;
    }

    if (
      data.type === Hls.ErrorTypes.MEDIA_ERROR &&
      hlsMediaRecoveryCount < 1
    ) {
      hlsMediaRecoveryCount += 1;
      waiting.value = true;
      hlsInstance.recoverMediaError();
      startFallbackProbe();
      return;
    }

    console.warn("Fatal HLS playback error", {
      type: data.type,
      details: data.details,
      source: source.src,
    });
    scheduleReconnect();
  });

  hlsInstance.attachMedia(media);
};

const stopPlaybackFailure = (): void => {
  clearReconnectTimer();
  clearFallbackProbeTimer();
  destroyHls();

  const media = mediaElement.value;
  media?.pause();

  waiting.value = false;
  playing.value = false;
  pendingAutoPlay.value = false;
  streamError.value = true;
  userPaused.value = true;
};

const applySource = async (
  index: number,
  autoplay = false,
): Promise<void> => {
  const media = mediaElement.value;
  const rawSource = sourceList.value[index];
  if (!media || !rawSource) {
    waiting.value = false;
    streamError.value = true;
    return;
  }

  if (autoplay && !userPaused.value) {
    if (attemptCount.value >= MAX_STREAM_ATTEMPTS) {
      stopPlaybackFailure();
      return;
    }
    attemptCount.value += 1;
  }

  const version = ++sourceVersion;
  activeSourceIndex.value = index;
  streamError.value = false;
  playing.value = false;
  pendingAutoPlay.value = autoplay && !userPaused.value;
  waiting.value = autoplay && !userPaused.value;

  clearReconnectTimer();
  clearFallbackProbeTimer();

  const source = await resolvePlaylistSource(rawSource);
  if (version !== sourceVersion || !mediaElement.value) return;

  activeResolvedSrc = source.src;

  if (isHlsSource(source)) {
    await configureHlsSource(source, autoplay, version);
  } else {
    configureNativeSource(source, autoplay);
  }
};

const advanceFallbackSource = (): boolean => {
  if (
    sourceList.value.length === 0 ||
    attemptCount.value >= MAX_STREAM_ATTEMPTS
  ) {
    stopPlaybackFailure();
    return false;
  }

  const nextIndex = nextPlaybackIndex(
    activeSourceIndex.value,
    sourceList.value.length,
  );
  if (nextIndex < 0) {
    stopPlaybackFailure();
    return false;
  }

  userPaused.value = false;
  void applySource(nextIndex, true);
  return true;
};

const scheduleReconnect = (): void => {
  if (!online.value || userPaused.value || reconnectTimer) return;

  clearFallbackProbeTimer();

  if (attemptCount.value >= MAX_STREAM_ATTEMPTS) {
    stopPlaybackFailure();
    return;
  }

  waiting.value = true;
  pendingAutoPlay.value = true;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    advanceFallbackSource();
  }, RECONNECT_BASE_DELAY);
};

const onPlay = async (): Promise<void> => {
  if (!hasPlayableSource.value) return;

  listening.remember(playback.station, 'play');
  userPaused.value = false;
  streamError.value = false;
  pendingAutoPlay.value = true;

  if (activeResolvedSrc && mediaElement.value) {
    startFallbackProbe();
    await tryPlay();
    return;
  }

  await applySource(activeSourceIndex.value, true);
};

const onPause = (): void => {
  sleepTimer.cancel();
  listening.remember(playback.station, 'pause');
  const media = mediaElement.value;
  playVersion += 1;

  userPaused.value = true;
  pendingAutoPlay.value = false;
  clearReconnectTimer();
  clearFallbackProbeTimer();
  removeAutoPlayUnlockListeners?.();
  removeAutoPlayUnlockListeners = null;

  media?.pause();
  waiting.value = false;
  playing.value = false;
};

const sleepRemaining = ref(0);
const sleepTimer = createSleepTimer({
  onExpire: () => onPause(),
  onChange: (minutes: number) => { sleepRemaining.value = minutes; },
});
const sleepMenuItems = computed(() => [
  ...[15, 30, 60, 120].map(minutes => ({
    label: t('player.sleep_minutes', { minutes }),
    icon: 'i-lucide-timer',
    onSelect: () => sleepTimer.start(minutes),
  })),
  { label: t('player.sleep_cancel'), icon: 'i-lucide-x', disabled: !sleepRemaining.value, onSelect: () => sleepTimer.cancel() },
]);
const checkSleepDeadline = () => { if (!document.hidden) sleepTimer.check(); };

const retryCurrentSource = (): void => {
  attemptCount.value = 0;
  userPaused.value = false;
  void applySource(activeSourceIndex.value, true);
};

const selectSource = (index: number): void => {
  if (!sourceList.value[index]) return;

  attemptCount.value = 0;
  streamError.value = false;
  userPaused.value = false;
  pendingAutoPlay.value = true;
  activeResolvedSrc = "";
  void applySource(index, true);
};

const onSourceChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement;
  selectSource(Number(target.value));
};

const selectStation = (station: RadioStationOption): void => {
  if (station.id === props.activeStationId) {
    if (!playing.value && hasPlayableSource.value) {
      void onPlay();
    }
    mobileQueueOpen.value = false;
    return;
  }

  userPaused.value = false;
  pendingAutoPlay.value = true;
  mobileQueueOpen.value = false;
  emit("select-station", station);
};

const navigateStation = (offset: -1 | 1): void => {
  const station = adjacentStation(offset);
  if (!station) return;

  selectStation(station);
};

// Media Session integrates live radio with iOS lock-screen / Control Center
// metadata and headset controls. Track controls switch STATIONS, never songs:
// an individual song cannot be skipped in a linear live broadcast.
const mediaSessionActions = ['play', 'pause', 'nexttrack', 'previoustrack', 'seekforward', 'seekbackward'] as const;
const updateMediaSession = (): void => {
  if (!import.meta.client || !('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
  const details = buildRadioMediaMetadata({
    title: nowPlayingTitle.value,
    artist: nowPlayingArtist.value,
    station: props.streamName,
    artwork: nowPlayingArtwork.value,
    fallbackArtwork: props.thumb,
  }, window.location.origin);
  navigator.mediaSession.metadata = new MediaMetadata(details);
  navigator.mediaSession.playbackState = playing.value ? 'playing' : 'paused';
};

const registerMediaSession = (): void => {
  if (!('mediaSession' in navigator)) return;
  const handlers = {
    play: () => { void onPlay(); },
    pause: () => onPause(),
    nexttrack: () => navigateStation(1),
    previoustrack: () => navigateStation(-1),
    // iOS may expose ±10s controls for live audio instead of track buttons.
    // They cannot seek the station stream, so use them to switch stations too.
    seekforward: () => navigateStation(1),
    seekbackward: () => navigateStation(-1),
  } as const;
  for (const action of mediaSessionActions) {
    try {
      navigator.mediaSession.setActionHandler(action, handlers[action]);
    } catch {
      // WebKit versions may support metadata but not every hardware action.
    }
  }
  // Linear live streams do not have a meaningful timeline to seek to.
  try { navigator.mediaSession.setActionHandler('seekto', null); } catch { /* unsupported */ }
};

const clearMediaSession = (): void => {
  if (!('mediaSession' in navigator)) return;
  for (const action of mediaSessionActions) {
    try { navigator.mediaSession.setActionHandler(action, null); } catch { /* unsupported */ }
  }
  navigator.mediaSession.metadata = null;
};

const toggleMute = (): void => {
  const media = mediaElement.value;
  if (!media) return;
  media.muted = !media.muted;
};

const onVolumeInput = (event: Event): void => {
  const media = mediaElement.value;
  if (!media || systemVolumeOnly.value) return;

  const target = event.target as HTMLInputElement;
  const nextVolume = Math.max(0, Math.min(1, Number(target.value)));
  media.volume = nextVolume;

  if (nextVolume > 0 && media.muted) {
    media.muted = false;
  }
};

const updateOnlineStatus = (): void => {
  const wasOffline = !online.value;
  online.value = navigator.onLine;

  if (!online.value) {
    clearReconnectTimer();
    clearFallbackProbeTimer();
    waiting.value = false;
    return;
  }

  if (wasOffline && !userPaused.value) {
    retryCurrentSource();
  }
};

const onMediaCanPlay = (): void => {
  clearReconnectTimer();
  clearFallbackProbeTimer();
  streamError.value = false;

  if (pendingAutoPlay.value && !userPaused.value && !playing.value) {
    void tryPlay();
  }
};

const onMediaPlaying = (): void => {
  listening.remember(playback.station, 'play', true);
  clearReconnectTimer();
  clearFallbackProbeTimer();
  attemptCount.value = 0;
  pendingAutoPlay.value = false;
  waiting.value = false;
  playing.value = true;
  streamError.value = false;
};

const onMediaWaiting = (): void => {
  if (!userPaused.value) {
    waiting.value = true;
    startFallbackProbe();
  }
};

const onMediaPause = (): void => {
  playing.value = false;
};

const onMediaEnded = (): void => {
  playing.value = false;
  if (!userPaused.value) scheduleReconnect();
};

const onMediaError = (): void => {
  if (!activeResolvedSrc || userPaused.value) return;

  // hls.js reports richer network/media failures through Hls.Events.ERROR.
  // Handling the media element error as well can schedule a duplicate retry
  // while the MediaSource is still attaching.
  if (hlsInstance) return;

  waiting.value = false;
  playing.value = false;
  scheduleReconnect();
};

const onVolumeChange = (): void => {
  const media = mediaElement.value;
  if (!media) return;
  volume.value = media.volume;
  muted.value = media.muted;
};

const bindMediaEvents = (): void => {
  const media = mediaElement.value;
  if (!media) return;

  media.addEventListener("canplay", onMediaCanPlay);
  media.addEventListener("playing", onMediaPlaying);
  media.addEventListener("waiting", onMediaWaiting);
  media.addEventListener("stalled", onMediaWaiting);
  media.addEventListener("pause", onMediaPause);
  media.addEventListener("ended", onMediaEnded);
  media.addEventListener("error", onMediaError);
  media.addEventListener("volumechange", onVolumeChange);
};

const unbindMediaEvents = (): void => {
  const media = mediaElement.value;
  if (!media) return;

  media.removeEventListener("canplay", onMediaCanPlay);
  media.removeEventListener("playing", onMediaPlaying);
  media.removeEventListener("waiting", onMediaWaiting);
  media.removeEventListener("stalled", onMediaWaiting);
  media.removeEventListener("pause", onMediaPause);
  media.removeEventListener("ended", onMediaEnded);
  media.removeEventListener("error", onMediaError);
  media.removeEventListener("volumechange", onVolumeChange);
};

watch([playing, waiting], ([isPlaying, isWaiting]) => {
  playback.playing = isPlaying;
  playback.waiting = isWaiting;
});

// Track/station images and song titles can update asynchronously via Zing;
// keep lock-screen metadata synchronized without restarting playback.
watch(
  [nowPlayingTitle, nowPlayingArtist, nowPlayingArtwork, () => props.streamName, playing],
  updateMediaSession,
  { flush: 'post' },
);

const sourceSignature = computed(() => JSON.stringify([props.stationUrl, sourceList.value]));
watch(
  [sourceSignature, () => props.playRequest, () => props.pauseRequest],
  ([signature, request, pause], [previousSignature, previousRequest, previousPause]) => {
    if (pause !== previousPause) onPause();
    if (signature === previousSignature) {
      if (request !== previousRequest) void onPlay();
      return;
    }
    const autoplay = !userPaused.value || request !== previousRequest;
    sourceVersion += 1;
    activeSourceIndex.value = 0;
    activeResolvedSrc = "";
    attemptCount.value = 0;
    streamError.value = false;
    playing.value = false;
    waiting.value = false;
    pendingAutoPlay.value = false;
    clearReconnectTimer();
    clearFallbackProbeTimer();
    removeAutoPlayUnlockListeners?.();
    removeAutoPlayUnlockListeners = null;
    destroyHls();
    const media = mediaElement.value;
    if (media) {
      media.pause();
      media.removeAttribute("src");
      media.load();
    }
    userPaused.value = !autoplay;
    if (autoplay && hasPlayableSource.value) void applySource(0, true);
  },
  { flush: "post" },
);

watch(() => props.country, () => {
  const [, area, country] = props.country.split(".");
  if (area && country) $store.setTimezone(area.replace(/_/g, "-"), country.replace(/_/g, "-"));
});

onMounted(() => {
  document.addEventListener("visibilitychange", checkSleepDeadline);
  window.addEventListener("pageshow", checkSleepDeadline);
  playerCompact.value = localStorage.getItem('radio:player-compact') === '1';
  playerMini.value = localStorage.getItem('radio:player-mini') === '1';
  playback.queueOpen = localStorage.getItem(PLAYER_QUEUE_OPEN_KEY) === '1' && !playerMini.value;
  systemVolumeOnly.value = usesSystemVolumeControls(navigator);
  const [, area, country] = props.country.split(".");
  if (area && country) {
    $store.setTimezone(area.replace(/_/g, "-"), country.replace(/_/g, "-"));
  }

  updateViewport();
  window.addEventListener("resize", updateViewport);
  online.value = navigator.onLine;

  bindMediaEvents();
  registerMediaSession();
  updateMediaSession();

  const media = mediaElement.value;
  if (media) {
    volume.value = media.volume;
    muted.value = media.muted;
  }

  // hls.js is loaded on demand by configureHlsSource; plain streams need no HLS download.

  // Reload restores a selection, never playback. Only a click in this session can play.
  const autoPlayEnabled = Boolean(props.playRequest);
  userPaused.value = !autoPlayEnabled;

  if (autoPlayEnabled && hasPlayableSource.value) {
    void applySource(0, true);
  }

  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
});

onUnmounted(() => {
  sleepTimer.cancel();
  document.removeEventListener("visibilitychange", checkSleepDeadline);
  window.removeEventListener("pageshow", checkSleepDeadline);
  clearMediaSession();
  sourceVersion += 1;
  clearReconnectTimer();
  clearFallbackProbeTimer();
  unbindMediaEvents();
  destroyHls();

  removeAutoPlayUnlockListeners?.();
  removeAutoPlayUnlockListeners = null;

  window.removeEventListener("resize", updateViewport);
  window.removeEventListener("online", updateOnlineStatus);
  window.removeEventListener("offline", updateOnlineStatus);
});
</script>

<style scoped>
.radio-audio-host {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  opacity: 0;
  pointer-events: none;
}

.radio-player-console {
  isolation: isolate;
}

.radio-player-dock-compact {
  --radio-player-height: 64px;
}

.radio-player-artwork {
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--radio-border) 58%, transparent);
}

.radio-player-title {
  overflow: hidden;
  white-space: nowrap;
}

.radio-player-title span {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
}

.radio-player-meta {
  line-height: 1rem;
}

.radio-player-meta-placeholder {
  display: none;
}

.radio-player-live-pill {
  letter-spacing: 0;
}

.radio-player-main-action:not(:disabled):hover {
  transform: translateY(-1px);
}

.radio-player-main-action:not(:disabled):active {
  transform: translateY(0);
}

@media (max-width: 639px) {
  .radio-player-console {
    position: relative;
  }

  .radio-player-console > :first-child {
    padding-right: 6.25rem;
  }

  .radio-player-meta {
    min-height: 1rem;
  }

  .radio-player-meta-placeholder {
    display: block;
  }

  .radio-player-controls {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}

.radio-bar.is-playing:nth-child(1) {
  animation: radio-eq 0.8s ease-in-out infinite alternate;
}

.radio-bar.is-playing:nth-child(2) {
  animation: radio-eq 0.62s ease-in-out 0.12s infinite alternate;
}

.radio-bar.is-playing:nth-child(3) {
  animation: radio-eq 0.72s ease-in-out 0.24s infinite alternate;
}

@keyframes radio-eq {
  from { transform: scaleY(0.45); }
  to { transform: scaleY(1); }
}

@media (max-width: 639px) {
  .radio-player-title-marquee span {
    max-width: none;
    min-width: 100%;
    overflow: visible;
    padding-right: 2rem;
    text-overflow: clip;
    animation: radio-title-marquee 10s linear infinite;
  }
}

@media (prefers-reduced-motion: reduce) {
  .radio-player-title-marquee span {
    animation: none;
  }
}

@keyframes radio-title-marquee {
  0%, 18% { transform: translateX(0); }
  82%, 100% { transform: translateX(calc(-100% + 11rem)); }
}

.radio-volume::-webkit-slider-thumb {
  width: 12px;
  height: 12px;
  appearance: none;
  border-radius: 9999px;
  background: #fb7185;
  box-shadow: 0 0 0 3px rgba(251, 113, 133, 0.16);
}

.radio-volume::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border: 0;
  border-radius: 9999px;
  background: #fb7185;
  box-shadow: 0 0 0 3px rgba(251, 113, 133, 0.16);
}
/* Keep a 44px touch target without making the visible mobile track oversized. */
.radio-volume-mobile::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 9999px;
  background: var(--radio-track);
}

.radio-volume-mobile::-moz-range-track {
  height: 4px;
  border-radius: 9999px;
  background: var(--radio-track);
}

.radio-volume-mobile::-webkit-slider-thumb {
  width: 22px;
  height: 22px;
  margin-top: -9px;
}

.radio-volume-mobile::-moz-range-thumb {
  width: 22px;
  height: 22px;
}
</style>

