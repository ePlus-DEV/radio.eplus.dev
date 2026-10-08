<template>
  <section class="w-full min-w-0 pb-4 sm:pb-8">
    <div
      class="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-slate-900"
    >
      <div
        class="grid min-w-0"
        :class="
          hasQueuePanel
            ? 'lg:grid-cols-[minmax(0,1fr)_360px]'
            : 'lg:grid-cols-1'
        "
      >
        <div class="relative min-w-0 overflow-hidden p-4 sm:p-6">
          <div
            class="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.13),transparent_42%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.10),transparent_38%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.12),transparent_42%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.07),transparent_38%)]"
          ></div>

          <div class="relative">
            <div class="flex items-center justify-between gap-3">
              <div class="flex min-w-0 items-center gap-2">
                <span
                  class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-rose-600 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                  Live
                </span>
                <span
                  v-if="sourceList.length > 1"
                  class="truncate text-[11px] font-medium text-slate-400 dark:text-slate-500"
                >
                  Source {{ activeSourceIndex + 1 }}/{{ sourceList.length }}
                </span>
              </div>

              <button
                v-if="hasQueuePanel"
                type="button"
                class="relative flex h-9 shrink-0 items-center gap-2 rounded-full bg-slate-100 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 hover:text-slate-950 lg:hidden dark:bg-white/[0.07] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                :aria-expanded="mobileQueueOpen"
                aria-label="Toggle playlist"
                @click="mobileQueueOpen = !mobileQueueOpen"
              >
                <svg viewBox="0 0 24 24" class="h-4 w-4 fill-none stroke-current" aria-hidden="true">
                  <path d="M4 6h11M4 11h11M4 16h7" stroke-width="1.8" stroke-linecap="round"></path>
                  <path d="m16 14 4 2.5-4 2.5v-5Z" stroke-width="1.8" stroke-linejoin="round"></path>
                </svg>
                <span>{{ queueCount || "…" }}</span>
              </button>
            </div>

            <div class="mt-4 flex min-w-0 items-center gap-4 sm:mt-5 sm:gap-5">
              <div
                class="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[24px] border border-slate-200 bg-white p-2.5 shadow-md shadow-slate-950/5 sm:h-32 sm:w-32 dark:border-white/10"
              >
                <img
                  loading="lazy"
                  :src="nowPlayingArtwork"
                  :alt="nowPlayingTitle"
                  class="max-h-full max-w-full object-contain"
                />
                <span
                  v-if="playing"
                  class="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-end justify-center gap-[2px] rounded-full bg-slate-950/80 pb-2 text-white backdrop-blur dark:bg-white/90 dark:text-slate-950"
                  aria-hidden="true"
                >
                  <span class="radio-bar h-1 w-[2px] rounded-full bg-current is-playing"></span>
                  <span class="radio-bar h-2.5 w-[2px] rounded-full bg-current is-playing"></span>
                  <span class="radio-bar h-1.5 w-[2px] rounded-full bg-current is-playing"></span>
                </span>
              </div>

              <div class="min-w-0 flex-1">
                <p class="truncate text-xs font-medium text-slate-400 dark:text-slate-500">
                  {{ streamName || $t(country) }}
                </p>

                <h2 class="mt-1.5 line-clamp-2 text-xl font-bold leading-tight tracking-tight text-slate-950 sm:text-2xl dark:text-white">
                  {{ nowPlayingTitle }}
                </h2>

                <p
                  v-if="nowPlayingArtist"
                  class="mt-1.5 truncate text-sm text-slate-500 dark:text-slate-400"
                >
                  {{ nowPlayingArtist }}
                </p>

                <div class="mt-2 flex min-w-0 items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  <span class="truncate">{{ $t(country) }}</span>
                  <span aria-hidden="true">•</span>
                  <span :title="currentDate" class="shrink-0 tabular-nums">{{ currentTime }}</span>
                </div>
              </div>
            </div>

            <div class="mt-5 flex items-center gap-3 sm:mt-6">
              <button
                v-if="waiting"
                type="button"
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow-sm ring-1 ring-slate-200 sm:h-16 sm:w-16 dark:bg-white/10 dark:text-white dark:ring-white/10"
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
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg shadow-slate-950/15 transition hover:scale-[1.04] active:scale-95 sm:h-16 sm:w-16 dark:bg-white dark:text-slate-950"
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

              <div class="hidden min-w-0 flex-1 items-center gap-3 sm:flex">
                <button
                  type="button"
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
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
                  class="radio-volume h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 dark:bg-white/15"
                />

                <span class="w-8 shrink-0 text-right text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
                  {{ Math.round((muted ? 0 : volume) * 100) }}%
                </span>
              </div>

              <div class="ml-auto flex items-center gap-1.5 sm:ml-0">
                <button
                  type="button"
                  class="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 sm:hidden dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
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
              v-if="mobileQueueOpen && hasQueuePanel"
              class="mt-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/70 lg:hidden dark:border-white/10 dark:bg-slate-950/35"
            >
              <PlayerQueue
                :playlist="playlist || []"
                :program="program || []"
                :thumb="thumb"
                :station-name="streamName || $t(country)"
              />
            </div>

            <div
              v-if="streamError"
              class="mt-4 flex items-center justify-between gap-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-400/20"
              role="alert"
            >
              <div class="flex min-w-0 items-center gap-2">
                <fa :icon="['fas', 'triangle-exclamation']" class="shrink-0" />
                <span class="truncate">{{ $t("alert.stream_error") }}</span>
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
              <fa :icon="['fas', 'wifi-slash']" class="shrink-0" />
              <span>{{ $t("text.offline") }}</span>
            </div>

            <div
              v-if="song?.currentMedia"
              class="mt-4 border-t border-slate-100 pt-4 dark:border-white/10"
            >
              <div class="flex min-w-0 items-center gap-3">
                <img
                  v-if="song.currentMedia.thumbnail || song.thumbnail"
                  :src="song.currentMedia.thumbnail || song.thumbnail"
                  :alt="song.currentMedia.title"
                  class="h-11 w-11 shrink-0 rounded-xl object-cover"
                />
                <div class="min-w-0">
                  <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                    Now playing
                  </p>
                  <p class="mt-0.5 truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                    {{ song.currentMedia.title }}
                    <span v-if="song.currentMedia.artists" class="font-normal text-slate-400 dark:text-slate-500">
                      · {{ song.currentMedia.artists }}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="radio-videojs-host" aria-hidden="true">
            <audio ref="mediaElement" class="video-js" playsinline preload="none"></audio>
          </div>
        </div>

        <aside
          v-if="hasQueuePanel"
          class="hidden min-h-[360px] border-l border-slate-200/80 bg-slate-50/60 lg:block dark:border-white/10 dark:bg-slate-950/30"
        >
          <PlayerQueue
            :playlist="playlist || []"
            :program="program || []"
            :thumb="thumb"
            :station-name="streamName || $t(country)"
          />
        </aside>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import videojs from "video.js";
import "video.js/dist/video-js.css";
import type { RadioSource } from "~/types/radio";

type VideoJsPlayer = ReturnType<typeof videojs>;

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
  queueExpected?: boolean;
}>();

const $store = useMainStore();
const dayjs = useDayjs();
const mediaElement = ref<HTMLAudioElement | null>(null);
const online = ref(true);
const waiting = ref(false);
const playing = ref(false);
const streamError = ref(false);
const activeSourceIndex = ref(0);
const pendingAutoPlay = ref(false);
const userPaused = ref(false);
const reconnectAttempts = ref(0);
const volume = ref(1);
const muted = ref(false);
const mobileQueueOpen = ref(false);
const currentDate = ref(dayjs().tz($store.getTimezone).format("LLLL"));
const currentTime = ref(dayjs().tz($store.getTimezone).format("LTS"));

let player: VideoJsPlayer | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let sourceReadyTimer: ReturnType<typeof setTimeout> | null = null;
let fallbackProbeTimer: ReturnType<typeof setTimeout> | null = null;
let timeInterval: ReturnType<typeof setInterval> | null = null;
let sourceVersion = 0;
let removeAutoPlayUnlockListeners: (() => void) | null = null;

const MAX_RECONNECT_ATTEMPTS = 2;
const RECONNECT_BASE_DELAY = 1500;
const SOURCE_READY_TIMEOUT = 8000;
const FALLBACK_PROBE_TIMEOUT = 4000;

const sourceList = computed<RadioSource[]>(() => {
  const candidates =
    Array.isArray(props.streamUrls) && props.streamUrls.length
      ? props.streamUrls
      : [props.streamUrl];

  return candidates.filter(
    (source): source is RadioSource =>
      Boolean(source && typeof source.src === "string" && source.src.trim()),
  );
});

const hasPlayableSource = computed(() => sourceList.value.length > 0);

const queueCount = computed(
  () => (props.playlist?.length || 0) + (props.program?.length || 0),
);
const hasQueuePanel = computed(
  () => queueCount.value > 0 || Boolean(props.queueExpected),
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
  if (/\.m3u8(?:$|[?#])/i.test(value)) return "application/x-mpegURL";
  if (/\.aac(?:$|[?#])/i.test(value)) return "audio/aac";
  if (/\.ogg(?:$|[?#])/i.test(value)) return "audio/ogg";
  if (/\.opus(?:$|[?#])/i.test(value)) return "audio/opus";
  if (/\.mp3(?:$|[?#])/i.test(value)) return "audio/mpeg";
  return fallback || "audio/mpeg";
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

const clearReconnectTimer = (): void => {
  if (!reconnectTimer) return;
  clearTimeout(reconnectTimer);
  reconnectTimer = null;
};

const clearSourceReadyTimer = (): void => {
  if (!sourceReadyTimer) return;
  clearTimeout(sourceReadyTimer);
  sourceReadyTimer = null;
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
  if (!player || userPaused.value) return;

  try {
    await player.play();
    pendingAutoPlay.value = false;
    waiting.value = false;
    playing.value = true;
    streamError.value = false;
    if (import.meta.client) {
      localStorage.setItem("radio_autoplay_enabled", "1");
    }
  } catch (error) {
    waiting.value = false;
    pendingAutoPlay.value = true;
    registerAutoPlayUnlock();
    console.warn("Playback requires user interaction:", error);
  }
};

const applySource = async (
  index: number,
  autoplay = false,
): Promise<void> => {
  if (!player) return;

  const rawSource = sourceList.value[index];
  if (!rawSource) {
    waiting.value = false;
    streamError.value = true;
    return;
  }

  const version = ++sourceVersion;
  activeSourceIndex.value = index;
  waiting.value = autoplay && !userPaused.value;
  playing.value = false;
  streamError.value = false;
  pendingAutoPlay.value = autoplay && !userPaused.value;
  clearSourceReadyTimer();
  clearFallbackProbeTimer();

  const source = await resolvePlaylistSource(rawSource);
  if (version !== sourceVersion || !player) return;

  player.src({
    src: source.src,
    type: inferMime(source.src, source.type),
  });
  player.load();

  if (
    autoplay &&
    !userPaused.value &&
    activeSourceIndex.value + 1 < sourceList.value.length
  ) {
    fallbackProbeTimer = setTimeout(() => {
      fallbackProbeTimer = null;
      if (
        pendingAutoPlay.value &&
        !playing.value &&
        !userPaused.value
      ) {
        console.warn(
          `Radio source ${activeSourceIndex.value + 1} did not become playable within ${FALLBACK_PROBE_TIMEOUT}ms; trying fallback.`,
        );
        advanceFallbackSource();
      }
    }, FALLBACK_PROBE_TIMEOUT);
  }

  if (autoplay && !userPaused.value) {
    sourceReadyTimer = setTimeout(() => {
      sourceReadyTimer = null;
      if (waiting.value && !userPaused.value) {
        scheduleReconnect();
      }
    }, SOURCE_READY_TIMEOUT);
  }
};

const advanceFallbackSource = (): boolean => {
  if (activeSourceIndex.value + 1 >= sourceList.value.length) return false;

  reconnectAttempts.value = 0;
  userPaused.value = false;
  void applySource(activeSourceIndex.value + 1, true);
  return true;
};

const scheduleReconnect = (): void => {
  if (!online.value || userPaused.value || reconnectTimer) return;

  clearSourceReadyTimer();

  if (reconnectAttempts.value >= MAX_RECONNECT_ATTEMPTS) {
    if (advanceFallbackSource()) return;
    waiting.value = false;
    playing.value = false;
    streamError.value = true;
    return;
  }

  reconnectAttempts.value += 1;
  waiting.value = true;
  pendingAutoPlay.value = true;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    void applySource(activeSourceIndex.value, true);
  }, RECONNECT_BASE_DELAY * reconnectAttempts.value);
};

const onPlay = async (): Promise<void> => {
  if (!player || !hasPlayableSource.value) return;

  userPaused.value = false;
  streamError.value = false;
  pendingAutoPlay.value = true;

  if (!player.currentSrc()) {
    await applySource(activeSourceIndex.value, true);
    return;
  }

  await tryPlay();
};

const onPause = (): void => {
  userPaused.value = true;
  pendingAutoPlay.value = false;
  clearReconnectTimer();
  clearSourceReadyTimer();
  clearFallbackProbeTimer();
  removeAutoPlayUnlockListeners?.();
  removeAutoPlayUnlockListeners = null;
  player?.pause();
  waiting.value = false;
  playing.value = false;
};

const retryCurrentSource = (): void => {
  reconnectAttempts.value = 0;
  userPaused.value = false;
  void applySource(activeSourceIndex.value, true);
};

const toggleMute = (): void => {
  if (!player) return;
  player.muted(!player.muted());
};

const onVolumeInput = (event: Event): void => {
  if (!player) return;
  const target = event.target as HTMLInputElement;
  const nextVolume = Math.max(0, Math.min(1, Number(target.value)));
  player.volume(nextVolume);
  if (nextVolume > 0 && player.muted()) player.muted(false);
};

const updateOnlineStatus = (): void => {
  const wasOffline = !online.value;
  online.value = navigator.onLine;

  if (!online.value) {
    clearReconnectTimer();
    clearSourceReadyTimer();
    waiting.value = false;
    return;
  }

  if (wasOffline && !userPaused.value) {
    retryCurrentSource();
  }
};

const bindPlayerEvents = (): void => {
  if (!player) return;

  player.on("loadstart", () => {
    waiting.value = pendingAutoPlay.value && !userPaused.value;
    streamError.value = false;
  });

  player.on("canplay", () => {
    clearSourceReadyTimer();
    clearFallbackProbeTimer();
    clearReconnectTimer();
    reconnectAttempts.value = 0;
    waiting.value = false;
    streamError.value = false;
    if (pendingAutoPlay.value && !userPaused.value) {
      void tryPlay();
    }
  });

  player.on("playing", () => {
    clearSourceReadyTimer();
    clearFallbackProbeTimer();
    waiting.value = false;
    playing.value = true;
    streamError.value = false;
  });

  player.on("pause", () => {
    playing.value = false;
  });

  player.on("ended", () => {
    playing.value = false;
    if (!userPaused.value) scheduleReconnect();
  });

  player.on("error", () => {
    waiting.value = false;
    playing.value = false;

    if (!userPaused.value) {
      scheduleReconnect();
    }
  });

  player.on("volumechange", () => {
    if (!player) return;
    volume.value = player.volume();
    muted.value = player.muted();
  });
};

watch(
  () => [props.streamUrl, props.streamUrls] as const,
  () => {
    activeSourceIndex.value = 0;
    mobileQueueOpen.value = false;
    reconnectAttempts.value = 0;
    streamError.value = false;

    if (player && hasPlayableSource.value) {
      const autoPlayEnabled =
        import.meta.client &&
        localStorage.getItem("radio_autoplay_enabled") === "1";
      userPaused.value = !autoPlayEnabled;
      void applySource(0, Boolean(autoPlayEnabled));
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

  if (mediaElement.value) {
    player = videojs(mediaElement.value, {
      controls: false,
      autoplay: false,
      preload: "none",
      audioOnlyMode: true,
      responsive: false,
      fluid: false,
      html5: {
        // Keep Video.js/VHS defaults. The pre-refactor player did not force
        // a low initial rendition and some audio-only HLS radios stall when
        // that tuning is applied.
        vhs: {},
      },
    });

    bindPlayerEvents();
    volume.value = player.volume();
    muted.value = player.muted();

    if (hasPlayableSource.value) {
      const autoPlayEnabled =
        localStorage.getItem("radio_autoplay_enabled") === "1";
      userPaused.value = !autoPlayEnabled;
      void applySource(0, autoPlayEnabled);
    }
  }

  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
});

onUnmounted(() => {
  sourceVersion += 1;
  clearReconnectTimer();
  clearSourceReadyTimer();
  clearFallbackProbeTimer();

  if (timeInterval) {
    clearInterval(timeInterval);
    timeInterval = null;
  }

  removeAutoPlayUnlockListeners?.();
  removeAutoPlayUnlockListeners = null;

  window.removeEventListener("online", updateOnlineStatus);
  window.removeEventListener("offline", updateOnlineStatus);

  player?.dispose();
  player = null;
});
</script>

<style scoped>
.radio-videojs-host {
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
