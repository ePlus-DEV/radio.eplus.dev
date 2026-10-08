<template>
  <section class="w-full min-w-0 pb-4 sm:pb-8">
    <div
      class="radio-themed-surface overflow-hidden rounded-[28px] border shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)]"
    >
      <div
        class="grid min-w-0"
        :class="
          hasSidebar
            ? 'xl:grid-cols-[minmax(0,1fr)_360px]'
            : 'lg:grid-cols-1'
        "
      >
        <div class="relative min-w-0 overflow-hidden p-4 sm:p-6">
          <div
            class="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.13),transparent_42%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.10),transparent_38%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.12),transparent_42%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.07),transparent_38%)]"
          ></div>

          <div class="relative">
            <div class="flex items-center justify-between gap-3">
              <div class="flex min-w-0 flex-1 items-center gap-2">
                <span
                  class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-rose-600 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                  Live
                </span>
                <label
                  v-if="sourceList.length > 1"
                  class="inline-flex min-w-0 items-center"
                >
                  <span class="sr-only">Select stream source</span>
                  <select
                    :value="activeSourceIndex"
                    class="select select-xs h-7 min-h-7 w-auto max-w-[132px] cursor-pointer rounded-full border-[var(--radio-border)] bg-[var(--radio-surface-soft)] py-0 pl-2.5 pr-7 text-[11px] font-semibold text-[var(--radio-text-muted)] shadow-none outline-none transition hover:border-rose-300 hover:bg-[var(--radio-surface)] focus:border-rose-400 focus:outline-none sm:max-w-[260px]"
                    aria-label="Select stream source"
                    @change="onSourceChange"
                  >
                    <option
                      v-for="(source, index) in sourceList"
                      :key="`${source.src}-${index}`"
                      :value="index"
                    >
                      {{ index + 1 }}. {{ sourceName(source, index) }} · {{ sourceFormat(source) }} · {{ source.proxied ? "Proxy" : "Direct" }}
                    </option>
                  </select>
                </label>
              </div>

              <button
                v-if="hasSidebar"
                type="button"
                class="relative flex h-9 shrink-0 items-center gap-2 rounded-full bg-[var(--radio-surface-soft)] px-3 text-xs font-semibold text-[var(--radio-text-muted)] transition hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)] xl:hidden"
                :aria-expanded="mobileQueueOpen"
                aria-label="Toggle channels and schedule"
                @click="mobileQueueOpen = !mobileQueueOpen"
              >
                <svg viewBox="0 0 24 24" class="h-4 w-4 fill-none stroke-current" aria-hidden="true">
                  <path d="M4 6h11M4 11h11M4 16h7" stroke-width="1.8" stroke-linecap="round"></path>
                  <path d="m16 14 4 2.5-4 2.5v-5Z" stroke-width="1.8" stroke-linejoin="round"></path>
                </svg>
                <span>{{ sidebarCount }}</span>
              </button>
            </div>

            <div class="mt-4 flex min-w-0 items-center gap-4 sm:mt-5 sm:gap-5">
              <div
                class="radio-themed-artwork relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[24px] border border-[var(--radio-border)] p-2.5 shadow-md shadow-slate-950/5 sm:h-32 sm:w-32"
              >
                <img
                  loading="lazy"
                  :src="nowPlayingArtwork"
                  :alt="nowPlayingTitle"
                  class="max-h-full max-w-full object-contain"
                />
                <span
                  v-if="playing"
                  class="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-end justify-center gap-[2px] rounded-full bg-[var(--radio-inverse-bg)] pb-2 text-[var(--radio-inverse-text)] opacity-90 backdrop-blur"
                  aria-hidden="true"
                >
                  <span class="radio-bar h-1 w-[2px] rounded-full bg-current is-playing"></span>
                  <span class="radio-bar h-2.5 w-[2px] rounded-full bg-current is-playing"></span>
                  <span class="radio-bar h-1.5 w-[2px] rounded-full bg-current is-playing"></span>
                </span>
              </div>

              <div class="min-w-0 flex-1">
                <p dir="auto" class="truncate text-xs font-medium text-[var(--radio-text-muted)]">
                  {{ streamName || $t(country) }}
                </p>

                <h2 dir="auto" class="mt-1.5 line-clamp-2 text-xl font-bold leading-tight tracking-tight text-[var(--radio-text)] sm:text-2xl">
                  {{ nowPlayingTitle }}
                </h2>

                <p
                  v-if="nowPlayingArtist"
                  dir="auto"
                  class="mt-1.5 truncate text-sm text-[var(--radio-text-muted)]"
                >
                  {{ nowPlayingArtist }}
                </p>

                <div class="mt-2 flex min-w-0 items-center gap-2 text-xs text-[var(--radio-text-muted)]">
                  <span class="truncate">{{ $t(country) }}</span>
                  <span aria-hidden="true">•</span>
                  <span :title="currentDate" class="shrink-0 tabular-nums">{{ currentTime }}</span>
                </div>
              </div>
            </div>

            <div class="mt-5 flex items-center gap-3 sm:mt-6">
              <div class="flex shrink-0 items-center gap-2">
                <button
                  v-if="canNavigateStations"
                  type="button"
                  class="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] text-[var(--radio-text-muted)] transition hover:border-rose-300 hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)] active:scale-95 sm:h-11 sm:w-11"
                  :aria-label="previousStationLabel"
                  :title="previousStationLabel"
                  @click="navigateStation(-1)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    class="h-4.5 w-4.5 fill-none stroke-current"
                  >
                    <path
                      d="m14.5 7-5 5 5 5M8 7v10"
                      stroke-width="1.9"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>

                <button
                  v-if="waiting"
                  type="button"
                  class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--radio-surface-soft)] text-[var(--radio-text-muted)] shadow-sm ring-1 ring-[var(--radio-border)] sm:h-16 sm:w-16"
                  aria-label="Loading stream"
                  disabled
                >
                  <svg class="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle class="opacity-20" cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3"></circle>
                    <path class="opacity-80" fill="currentColor" d="M12 3a9 9 0 0 1 9 9h-3a6 6 0 0 0-6-6V3z"></path>
                  </svg>
                </button>

                <button
                  v-else-if="playing"
                  type="button"
                  class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--radio-inverse-bg)] text-[var(--radio-inverse-text)] shadow-lg shadow-slate-950/15 transition hover:scale-[1.04] active:scale-95 sm:h-16 sm:w-16"
                  @click="onPause"
                  aria-label="Pause radio"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" class="h-6 w-6 fill-current">
                    <rect x="6" y="5" width="4" height="14" rx="1"></rect>
                    <rect x="14" y="5" width="4" height="14" rx="1"></rect>
                  </svg>
                </button>

                <button
                  v-else
                  type="button"
                  class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/25 transition hover:scale-[1.04] hover:bg-rose-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:h-16 sm:w-16"
                  @click="onPlay"
                  :disabled="!hasPlayableSource"
                  aria-label="Play radio"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" class="ml-0.5 h-6 w-6 fill-current">
                    <path d="M8 5.7v12.6c0 .85.92 1.38 1.66.95l9.85-6.3a1.1 1.1 0 0 0 0-1.9l-9.85-6.3A1.1 1.1 0 0 0 8 5.7Z"></path>
                  </svg>
                </button>

                <button
                  v-if="canNavigateStations"
                  type="button"
                  class="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] text-[var(--radio-text-muted)] transition hover:border-rose-300 hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)] active:scale-95 sm:h-11 sm:w-11"
                  :aria-label="nextStationLabel"
                  :title="nextStationLabel"
                  @click="navigateStation(1)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    class="h-4.5 w-4.5 fill-none stroke-current"
                  >
                    <path
                      d="m9.5 7 5 5-5 5M16 7v10"
                      stroke-width="1.9"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div class="hidden min-w-0 flex-1 items-center gap-3 sm:flex">
                <button
                  type="button"
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--radio-text-muted)] transition hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]"
                  @click="toggleMute"
                  :aria-label="muted || volume === 0 ? 'Unmute' : 'Mute'"
                >
                  <svg
                    v-if="muted || volume === 0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    class="h-5 w-5 fill-none stroke-current"
                  >
                    <path d="M11 6 7.5 9H5v6h2.5L11 18V6Z" stroke-width="1.8" stroke-linejoin="round"></path>
                    <path d="m16 9 5 5m0-5-5 5" stroke-width="1.8" stroke-linecap="round"></path>
                  </svg>
                  <svg
                    v-else
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    class="h-5 w-5 fill-none stroke-current"
                  >
                    <path d="M11 6 7.5 9H5v6h2.5L11 18V6Z" stroke-width="1.8" stroke-linejoin="round"></path>
                    <path
                      v-if="volume >= 0.5"
                      d="M16 8.2c1.25 1 2 2.33 2 3.8s-.75 2.8-2 3.8"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    ></path>
                    <path d="M14.2 10.2c.55.5.8 1.1.8 1.8s-.25 1.3-.8 1.8" stroke-width="1.8" stroke-linecap="round"></path>
                  </svg>
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  :value="muted ? 0 : volume"
                  @input="onVolumeInput"
                  aria-label="Volume"
                  class="radio-volume h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[var(--radio-track)]"
                />

                <span class="w-8 shrink-0 text-right text-[11px] tabular-nums text-[var(--radio-text-muted)]">
                  {{ Math.round((muted ? 0 : volume) * 100) }}%
                </span>
              </div>

              <div class="ml-auto flex items-center gap-1.5 sm:ml-0">
                <button
                  type="button"
                  class="flex h-10 w-10 items-center justify-center rounded-full text-[var(--radio-text-muted)] transition hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)] sm:hidden"
                  @click="toggleMute"
                  :aria-label="muted || volume === 0 ? 'Unmute' : 'Mute'"
                >
                  <svg
                    v-if="muted || volume === 0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    class="h-5 w-5 fill-none stroke-current"
                  >
                    <path d="M11 6 7.5 9H5v6h2.5L11 18V6Z" stroke-width="1.8" stroke-linejoin="round"></path>
                    <path d="m16 9 5 5m0-5-5 5" stroke-width="1.8" stroke-linecap="round"></path>
                  </svg>
                  <svg
                    v-else
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    class="h-5 w-5 fill-none stroke-current"
                  >
                    <path d="M11 6 7.5 9H5v6h2.5L11 18V6Z" stroke-width="1.8" stroke-linejoin="round"></path>
                    <path d="M14.2 10.2c.55.5.8 1.1.8 1.8s-.25 1.3-.8 1.8" stroke-width="1.8" stroke-linecap="round"></path>
                  </svg>
                </button>

                <span
                  class="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 lg:inline-flex dark:bg-emerald-400/10 dark:text-emerald-300"
                  :class="{ 'opacity-50': !playing }"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                  {{ playing ? "On air" : waiting ? "Connecting" : "Ready" }}
                </span>
              </div>
            </div>

            <div
              v-if="mobileQueueOpen && hasSidebar"
              class="radio-themed-muted mt-5 h-[min(420px,60vh)] overflow-hidden rounded-2xl border border-[var(--radio-border)] xl:hidden"
            >
              <PlayerQueue
                :playlist="playlist || []"
                :program="program || []"
                :stations="stations || []"
                :active-station-id="activeStationId"
                :country-name="countryName || $t(country)"
                :schedule-loading="queueLoading"
                :thumb="thumb"
                :station-name="streamName || $t(country)"
                @select-station="selectStation"
              />
            </div>

            <div
              v-if="queueLoading && scheduleCount === 0 && stationCount === 0"
              class="mt-4 flex items-center gap-2 rounded-xl border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] px-3 py-2.5 text-xs text-[var(--radio-text-muted)]"
            >
              <span class="h-2 w-2 animate-pulse rounded-full bg-[var(--radio-text-muted)]"></span>
              <span>{{ $t("panel.updating") }}</span>
            </div>

            <div
              v-if="streamError"
              class="mt-4 flex items-center justify-between gap-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-400/20"
              role="alert"
            >
              <div class="flex min-w-0 items-center gap-2">
                <fa :icon="['fas', 'triangle-exclamation']" class="shrink-0" />
                <span class="truncate">
                  {{ $t("alert.stream_error") }}
                  <span v-if="attemptCount >= MAX_STREAM_ATTEMPTS" class="opacity-70">
                    · {{ attemptCount }}/{{ MAX_STREAM_ATTEMPTS }}
                  </span>
                </span>
              </div>
              <button
                type="button"
                class="shrink-0 rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-200 dark:bg-rose-400/15 dark:text-rose-100 dark:hover:bg-rose-400/25"
                @click="retryCurrentSource"
              >
                Retry
              </button>
            </div>

            <div
              v-if="!online"
              class="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-400/10 dark:text-amber-100 dark:ring-amber-300/20"
              role="alert"
            >
              <fa :icon="['fas', 'wifi']" class="shrink-0" />
              <span>{{ $t("text.offline") }}</span>
            </div>

            <div
              v-if="song?.currentMedia"
              class="mt-4 border-t border-[var(--radio-border)] pt-4"
            >
              <div class="flex min-w-0 items-center gap-3">
                <img
                  v-if="song.currentMedia.thumbnail || song.thumbnail"
                  :src="song.currentMedia.thumbnail || song.thumbnail"
                  :alt="song.currentMedia.title"
                  class="h-11 w-11 shrink-0 rounded-xl object-cover"
                />
                <div class="min-w-0">
                  <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--radio-text-muted)]">
                    Now playing
                  </p>
                  <p class="mt-0.5 truncate text-sm font-medium text-[var(--radio-text)]">
                    {{ song.currentMedia.title }}
                    <span v-if="song.currentMedia.artists" class="font-normal text-[var(--radio-text-muted)]">
                      · {{ song.currentMedia.artists }}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="radio-audio-host" aria-hidden="true">
            <audio ref="mediaElement" playsinline preload="none"></audio>
          </div>
        </div>

        <aside
          v-if="hasSidebar"
          class="radio-themed-muted hidden h-[360px] overflow-hidden border-l border-[var(--radio-border)] xl:block"
        >
          <PlayerQueue
            :playlist="playlist || []"
            :program="program || []"
            :stations="stations || []"
            :active-station-id="activeStationId"
            :country-name="countryName || $t(country)"
            :schedule-loading="queueLoading"
            :thumb="thumb"
            :station-name="streamName || $t(country)"
            @select-station="selectStation"
          />
        </aside>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { RadioSource, RadioStationOption } from "~/types/radio";
import {
  MAX_STREAM_ATTEMPTS,
  buildPlaybackSources,
  nextPlaybackIndex,
} from "~/utils/radio-source-plan.mjs";

interface CurrentMedia {
  title: string;
  artists: string;
  hasLyric: boolean;
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
}>();

const emit = defineEmits<{
  (event: "select-station", station: RadioStationOption): void;
}>();

const $store = useMainStore();
const dayjs = useDayjs();
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
const mobileQueueOpen = ref(false);
const currentDate = ref(dayjs().tz($store.getTimezone).format("LLLL"));
const currentTime = ref(dayjs().tz($store.getTimezone).format("LTS"));

let hlsInstance: any = null;
let HlsCtor: any = null;
let hlsImportPromise: Promise<any> | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let fallbackProbeTimer: ReturnType<typeof setTimeout> | null = null;
let timeInterval: ReturnType<typeof setInterval> | null = null;
let sourceVersion = 0;
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
  if (sourceKey === "primary" || index === 0) return "Primary";
  if (sourceKey.includes("alternative")) return "Alternative";
  if (sourceKey) {
    return sourceKey
      .split(/[-_]/g)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  return `Source ${index + 1}`;
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

  return "Stream";
};

const sourceHost = (source: RadioSource): string => {
  try {
    return new URL(source.src).hostname.replace(/^www\./, "");
  } catch {
    return source.proxied ? "Proxy" : "Direct";
  }
};

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
const activeStationIndex = computed(() =>
  stationList.value.findIndex((station) => station.id === props.activeStationId),
);

const adjacentStation = (offset: -1 | 1): RadioStationOption | undefined => {
  const list = stationList.value;
  if (list.length < 2) return undefined;

  const currentIndex = activeStationIndex.value;
  const baseIndex =
    currentIndex >= 0 ? currentIndex : offset > 0 ? -1 : 0;
  const index = (baseIndex + offset + list.length) % list.length;

  return list[index];
};

const previousStation = computed(() => adjacentStation(-1));
const nextStation = computed(() => adjacentStation(1));
const previousStationLabel = computed(() =>
  previousStation.value
    ? `Previous station: ${previousStation.value.title}`
    : "Previous station",
);
const nextStationLabel = computed(() =>
  nextStation.value
    ? `Next station: ${nextStation.value.title}`
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

const updateCurrentTime = (): void => {
  currentTime.value = dayjs().tz($store.getTimezone).format("LTS");
  currentDate.value = dayjs().tz($store.getTimezone).format("LLLL");
};

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

  waiting.value = true;

  try {
    await media.play();
    pendingAutoPlay.value = false;
    waiting.value = false;
    playing.value = true;
    streamError.value = false;

    if (import.meta.client) {
      localStorage.setItem("radio_autoplay_enabled", "1");
    }
  } catch (error) {
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
  const media = mediaElement.value;

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

  if (import.meta.client) {
    localStorage.setItem("radio_autoplay_enabled", "1");
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

const toggleMute = (): void => {
  const media = mediaElement.value;
  if (!media) return;
  media.muted = !media.muted;
};

const onVolumeInput = (event: Event): void => {
  const media = mediaElement.value;
  if (!media) return;

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

watch(
  () => [props.streamUrl, props.streamUrls] as const,
  () => {
    sourceVersion += 1;
    activeSourceIndex.value = 0;
    activeResolvedSrc = "";
    mobileQueueOpen.value = false;
    attemptCount.value = 0;
    streamError.value = false;
    clearReconnectTimer();
    clearFallbackProbeTimer();
    destroyHls();

    const media = mediaElement.value;
    if (media) {
      media.pause();
      media.removeAttribute("src");
      media.load();
    }

    const autoPlayEnabled =
      import.meta.client &&
      localStorage.getItem("radio_autoplay_enabled") === "1";

    userPaused.value = !autoPlayEnabled;

    if (autoPlayEnabled && hasPlayableSource.value) {
      void applySource(0, true);
    }
  },
  { deep: true },
);

onMounted(() => {
  const [, area, country] = props.country.split(".");
  if (area && country) {
    $store.setTimezone(area, country.replace(/_/g, "-"));
  }

  online.value = navigator.onLine;
  updateCurrentTime();
  timeInterval = setInterval(updateCurrentTime, 1000);

  bindMediaEvents();

  const media = mediaElement.value;
  if (media) {
    volume.value = media.volume;
    muted.value = media.muted;
  }

  // Preload hls.js while the page is idle so a later user click can start
  // the HLS pipeline immediately without waiting for a module download.
  if (import.meta.client) {
    void ensureHls();
  }

  const autoPlayEnabled =
    localStorage.getItem("radio_autoplay_enabled") === "1";
  userPaused.value = !autoPlayEnabled;

  if (autoPlayEnabled && hasPlayableSource.value) {
    void applySource(0, true);
  }

  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
});

onUnmounted(() => {
  sourceVersion += 1;
  clearReconnectTimer();
  clearFallbackProbeTimer();
  unbindMediaEvents();
  destroyHls();

  if (timeInterval) {
    clearInterval(timeInterval);
    timeInterval = null;
  }

  removeAutoPlayUnlockListeners?.();
  removeAutoPlayUnlockListeners = null;

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
</style>
