<template>
  <section class="w-full min-w-0 pb-6 sm:pb-8">
    <div
      class="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-slate-950 text-white shadow-2xl shadow-slate-950/20"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.20),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_42%)]"
      ></div>

      <div class="relative p-4 sm:p-6 lg:p-7">
        <div class="flex min-w-0 items-center gap-4 sm:gap-5">
          <div
            class="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-lg ring-1 ring-white/10 sm:h-24 sm:w-24"
          >
            <img
              loading="lazy"
              :src="thumb"
              :alt="$t(country)"
              class="max-h-full max-w-full object-contain"
            />
            <span
              class="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white"
            >
              <span
                class="absolute inset-0 animate-ping rounded-full bg-rose-400 opacity-75"
              ></span>
            </span>
          </div>

          <div class="min-w-0 flex-1">
            <div class="mb-2 flex flex-wrap items-center gap-2">
              <span
                class="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-300 ring-1 ring-inset ring-rose-400/20"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
                Live
              </span>
              <span
                v-if="sourceList.length > 1"
                class="rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-medium text-slate-300 ring-1 ring-inset ring-white/10"
              >
                Source {{ activeSourceIndex + 1 }}/{{ sourceList.length }}
              </span>
              <span
                class="hidden rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-medium text-slate-400 ring-1 ring-inset ring-white/10 sm:inline-flex"
              >
                Video.js
              </span>
            </div>

            <p class="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
              {{ $t("panel.play_from_radio") }}
            </p>
            <h2 class="mt-1 truncate text-xl font-semibold tracking-tight sm:text-2xl">
              {{ streamName || $t(country) }}
            </h2>
            <div class="mt-2 flex min-w-0 items-center gap-2 text-sm text-slate-400">
              <span class="truncate">{{ $t(country) }}</span>
              <span aria-hidden="true">•</span>
              <span :title="currentDate" class="shrink-0">{{ currentTime }}</span>
            </div>
          </div>

          <button
            type="button"
            class="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/8 text-slate-300 ring-1 ring-inset ring-white/10 transition hover:bg-white/15 hover:text-white sm:flex"
            aria-label="Bookmark station"
          >
            <fa :icon="['fal', 'bookmark']" />
          </button>
        </div>

        <div
          class="mt-5 flex min-w-0 flex-col gap-4 rounded-2xl bg-white/[0.06] p-3 ring-1 ring-inset ring-white/10 sm:flex-row sm:items-center sm:p-4"
        >
          <div class="flex items-center justify-center sm:justify-start">
            <button
              v-if="waiting"
              type="button"
              class="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-950 shadow-lg"
              aria-label="Loading stream"
              disabled
            >
              <svg
                class="h-6 w-6 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-20"
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  stroke-width="3"
                ></circle>
                <path
                  class="opacity-80"
                  fill="currentColor"
                  d="M12 3a9 9 0 0 1 9 9h-3a6 6 0 0 0-6-6V3z"
                ></path>
              </svg>
            </button>

            <button
              v-else-if="playing"
              type="button"
              class="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-950 shadow-lg transition hover:scale-105 hover:bg-rose-50 active:scale-95"
              @click="onPause"
              aria-label="Pause radio"
            >
              <fa :icon="['fas', 'pause']" class="text-lg" />
            </button>

            <button
              v-else
              type="button"
              class="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-950/30 transition hover:scale-105 hover:bg-rose-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              @click="onPlay"
              :disabled="!hasPlayableSource"
              aria-label="Play radio"
            >
              <fa :icon="['fas', 'play']" class="ml-0.5 text-lg" />
            </button>
          </div>

          <div class="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
              @click="toggleMute"
              :aria-label="muted || volume === 0 ? 'Unmute' : 'Mute'"
            >
              <fa
                :icon="['fas', muted || volume === 0 ? 'volume-xmark' : volume < 0.5 ? 'volume-low' : 'volume-high']"
              />
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              :value="muted ? 0 : volume"
              @input="onVolumeInput"
              aria-label="Volume"
              class="radio-volume h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/15"
            />

            <span class="w-9 shrink-0 text-right text-xs tabular-nums text-slate-500">
              {{ Math.round((muted ? 0 : volume) * 100) }}%
            </span>
          </div>

          <div class="radio-videojs-host" aria-hidden="true">
            <video
              ref="mediaElement"
              class="video-js"
              playsinline
              preload="auto"
            ></video>
          </div>
        </div>

        <div
          v-if="streamError"
          class="mt-3 flex items-center justify-between gap-3 rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-200 ring-1 ring-inset ring-rose-400/20"
          role="alert"
        >
          <div class="flex min-w-0 items-center gap-2">
            <fa :icon="['fas', 'triangle-exclamation']" class="shrink-0" />
            <span class="truncate">{{ $t("alert.stream_error") }}</span>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg bg-rose-400/15 px-2.5 py-1 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/25"
            @click="retryCurrentSource"
          >
            Retry
          </button>
        </div>

        <div
          v-if="!online"
          class="mt-3 flex items-center gap-2 rounded-xl bg-amber-400/10 px-3 py-2 text-sm text-amber-100 ring-1 ring-inset ring-amber-300/20"
          role="alert"
        >
          <fa :icon="['fas', 'wifi-slash']" class="shrink-0" />
          <span>{{ $t("text.offline") }}</span>
        </div>
      </div>

      <div
        v-if="
          (song !== undefined && song.currentMedia !== undefined) ||
          (program && program.length > 0) ||
          (playlist && playlist.length > 0)
        "
        class="relative border-t border-white/10 bg-slate-950/70"
      >
        <PlayerZingOnly :song="song" />
        <PlayerProgram :program="program" />
        <PlayerPlaylist :playlist="playlist || []" :thumb="thumb" />
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

const props = defineProps<{
  thumb: string;
  streamName: string;
  country: string;
  program?: Array<object>;
  streamUrl: RadioSource;
  streamUrls?: RadioSource[];
  song?: Song;
  playlist?: PlaylistItem[];
}>();

const $store = useMainStore();
const dayjs = useDayjs();
const mediaElement = ref<HTMLVideoElement | null>(null);
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
const currentDate = ref(dayjs().tz($store.getTimezone).format("LLLL"));
const currentTime = ref(dayjs().tz($store.getTimezone).format("LTS"));

let player: VideoJsPlayer | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let sourceReadyTimer: ReturnType<typeof setTimeout> | null = null;
let timeInterval: ReturnType<typeof setInterval> | null = null;
let sourceVersion = 0;
let removeAutoPlayUnlockListeners: (() => void) | null = null;

const MAX_RECONNECT_ATTEMPTS = 2;
const RECONNECT_BASE_DELAY = 1500;
const SOURCE_READY_TIMEOUT = 8000;

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
  waiting.value = true;
  playing.value = false;
  streamError.value = false;
  pendingAutoPlay.value = autoplay && !userPaused.value;
  clearSourceReadyTimer();

  const source = await resolvePlaylistSource(rawSource);
  if (version !== sourceVersion || !player) return;

  player.src({
    src: source.src,
    type: inferMime(source.src, source.type),
  });
  player.load();

  sourceReadyTimer = setTimeout(() => {
    sourceReadyTimer = null;
    if (waiting.value && !userPaused.value) {
      scheduleReconnect();
    }
  }, SOURCE_READY_TIMEOUT);
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
    waiting.value = true;
    streamError.value = false;
  });

  player.on("canplay", () => {
    clearSourceReadyTimer();
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
    if (!userPaused.value) scheduleReconnect();
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
    reconnectAttempts.value = 0;
    streamError.value = false;
    userPaused.value = false;

    if (player && hasPlayableSource.value) {
      const autoPlayEnabled =
        import.meta.client &&
        localStorage.getItem("radio_autoplay_enabled") === "1";
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
      preload: "auto",
      responsive: false,
      fluid: false,
      html5: {
        vhs: {
          enableLowInitialPlaylist: true,
        },
      },
    });

    bindPlayerEvents();
    volume.value = player.volume();
    muted.value = player.muted();

    if (hasPlayableSource.value) {
      const autoPlayEnabled =
        localStorage.getItem("radio_autoplay_enabled") === "1";
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

.radio-volume::-webkit-slider-thumb {
  width: 14px;
  height: 14px;
  appearance: none;
  border-radius: 9999px;
  background: #fb7185;
  box-shadow: 0 0 0 3px rgba(251, 113, 133, 0.16);
}

.radio-volume::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: 0;
  border-radius: 9999px;
  background: #fb7185;
  box-shadow: 0 0 0 3px rgba(251, 113, 133, 0.16);
}
</style>
