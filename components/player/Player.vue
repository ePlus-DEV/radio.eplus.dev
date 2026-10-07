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
              v-else-if="button"
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
              :disabled="streamError"
              :aria-disabled="streamError"
              :title="streamError ? $t('alert.stream_error') : ''"
              aria-label="Play radio"
            >
              <fa :icon="['fas', 'play']" class="ml-0.5 text-lg" />
            </button>
          </div>

          <div class="min-w-0 flex-1">
            <media-player
              class="player block w-full min-w-0 max-w-full"
              :title="streamName"
              :src="$src"
              crossOrigin
              playsInline
              @provider-change="onProviderChange"
              @can-play="onCanPlay"
              ref="$player"
              autoplay
              view-type="audio"
            >
              <media-provider></media-provider>
              <media-audio-layout></media-audio-layout>
            </media-player>
          </div>
        </div>

        <div
          v-if="streamError"
          class="mt-3 flex items-center gap-2 rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-200 ring-1 ring-inset ring-rose-400/20"
          role="alert"
        >
          <fa :icon="['fas', 'triangle-exclamation']" class="shrink-0" />
          <span>{{ $t("alert.stream_error") }}</span>
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
// Import styles.
import "vidstack/player/styles/default/theme.css";
import "vidstack/player/styles/default/layouts/audio.css";
import "vidstack/player/styles/default/layouts/video.css";
// Register elements.
import "vidstack/player";
import "vidstack/player/layouts";
import "vidstack/player/ui";
import "vidstack/icons";
import {
  isHLSProvider,
  type MediaCanPlayEvent,
  type MediaPlayerState,
  type MediaProviderChangeEvent,
} from "vidstack";
import type { MediaPlayerElement } from "vidstack/elements";
const online = ref(true);
const $store = useMainStore();
const dayjs = useDayjs();

const $player = ref<MediaPlayerElement>(),
  waiting = ref(true),
  streamError = ref(false),
  button = ref(true),
  currentDate = ref(dayjs().tz($store.getTimezone).format("LLLL")),
  currentTime = ref(dayjs().tz($store.getTimezone).format("LTS"));

const props = defineProps<{
  thumb: string;
  streamName: string;
  country: string;
  program?: Array<object>;
  streamUrl: MediaPlayerElement["src"];
  streamUrls?: MediaPlayerElement["src"][];
  song?: Song;
  playlist?: PlaylistItem[];
}>();

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
  // Add other properties as needed
}

interface PlaylistItem {
  track_title: string;
  track_artist: string;
  track_image: string;
  track_played: number;
}

const sourceList = computed<MediaPlayerElement["src"][]>(() => {
  const candidates = Array.isArray(props.streamUrls) && props.streamUrls.length
    ? props.streamUrls
    : [props.streamUrl];
  return candidates.filter(Boolean);
});
const activeSourceIndex = ref(0);
const $src = ref(sourceList.value[0] || props.streamUrl);
const pendingAutoPlay = ref(false);
const userPaused = ref(false);
const reconnectAttempts = ref(0);
const reconnectTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const removeAutoPlayUnlockListeners = ref<(() => void) | null>(null);
const pendingAutoPlayFallback = ref<ReturnType<typeof setTimeout> | null>(null);
let unsubscribePlayerState: (() => void) | undefined;
let timeInterval: ReturnType<typeof setInterval> | null = null;
const MAX_RECONNECT_ATTEMPTS = 2;
const RECONNECT_BASE_DELAY = 1500;

/**
 * Updates the online status.
 */
const updateOnlineStatus = () => {
  const wasOffline = !online.value;
  online.value = navigator.onLine;

  if (!online.value) {
    clearReconnectTimer();
    waiting.value = false;
    return;
  }

  if (wasOffline && !userPaused.value) {
    scheduleReconnect();
  }
};

/**
 * Handles the play action for the player.
 * If the player is not currently waiting, it will start playing and set a waiting state.
 * The waiting state is reset after a simulated waiting time of 1 second.
 */
function onPlay() {
  userPaused.value = false;

  // If player reports stream error (not ready), schedule an auto-play when ready
  if (streamError.value) {
    pendingAutoPlay.value = true;
    waiting.value = true;
    return;
  }

  // Try to play now (player reports can-play). Keep waiting until resolved.
  waiting.value = true;
  $player.value
    ?.play()
    .then(() => {
      waiting.value = false;
      pendingAutoPlay.value = false;
      if (import.meta.client)
        localStorage.setItem("radio_autoplay_enabled", "1");
    })
    .catch((err: unknown) => {
      // If play fails because media isn't ready, set pendingAutoPlay so onCanPlay will retry
      console.error("Playback start failed:", err);
      registerAutoPlayUnlock();
      // If error looks like 'media is not ready', ask to wait for can-play
      pendingAutoPlay.value = true;
      waiting.value = false;
    });
}

/**
 * Pauses the player if it is not already waiting.
 *
 * This function checks if the player is currently not in a waiting state.
 * If not, it pauses the player and sets the waiting state to true.
 * After a simulated waiting time of 1 second, it resets the waiting state to false.
 */
function onPause() {
  // Pause should always be allowed
  userPaused.value = true;
  clearReconnectTimer();
  removeAutoPlayUnlockListeners.value?.();
  removeAutoPlayUnlockListeners.value = null;
  $player.value?.pause();
  waiting.value = false;
}

function clearReconnectTimer() {
  if (reconnectTimer.value) {
    clearTimeout(reconnectTimer.value);
    reconnectTimer.value = null;
  }
}

function currentStreamSource(): MediaPlayerElement["src"] {
  return sourceList.value[activeSourceIndex.value] || props.streamUrl;
}

function refreshStreamSource() {
  // Reset then restore the current candidate to force provider reconnect.
  $src.value = "";
  nextTick(() => {
    $src.value = currentStreamSource();
  });
}

function advanceFallbackSource(): boolean {
  if (activeSourceIndex.value + 1 >= sourceList.value.length) return false;

  activeSourceIndex.value += 1;
  reconnectAttempts.value = 0;
  streamError.value = false;
  waiting.value = true;
  pendingAutoPlay.value = true;

  console.warn(
    `Radio stream failed; switching to fallback ${activeSourceIndex.value + 1}/${sourceList.value.length}`,
  );

  refreshStreamSource();
  return true;
}

function scheduleReconnect() {
  if (!online.value || userPaused.value || reconnectTimer.value) return;
  if (reconnectAttempts.value >= MAX_RECONNECT_ATTEMPTS) {
    if (advanceFallbackSource()) return;
    waiting.value = false;
    streamError.value = true;
    return;
  }

  reconnectAttempts.value += 1;
  const delay = RECONNECT_BASE_DELAY * reconnectAttempts.value;
  waiting.value = true;
  pendingAutoPlay.value = true;

  reconnectTimer.value = setTimeout(() => {
    reconnectTimer.value = null;
    refreshStreamSource();
  }, delay);
}

function registerAutoPlayUnlock() {
  if (!import.meta.client || removeAutoPlayUnlockListeners.value) return;

  const unlock = () => {
    removeAutoPlayUnlockListeners.value?.();
    removeAutoPlayUnlockListeners.value = null;
    onPlay();
  };

  const events = ["pointerdown", "keydown", "touchstart"];
  events.forEach((eventName) => {
    window.addEventListener(eventName, unlock, { once: true });
  });

  removeAutoPlayUnlockListeners.value = () => {
    events.forEach((eventName) => {
      window.removeEventListener(eventName, unlock);
    });
  };
}

// watch stream candidates
watch(
  () => [props.streamUrl, props.streamUrls] as const,
  () => {
    activeSourceIndex.value = 0;
    waiting.value = true;
    streamError.value = false;
    userPaused.value = false;
    $src.value = currentStreamSource();
    reconnectAttempts.value = 0;
    clearReconnectTimer();
    pendingAutoPlay.value = true;

    if (pendingAutoPlayFallback.value) {
      clearTimeout(pendingAutoPlayFallback.value);
      pendingAutoPlayFallback.value = null;
    }

    pendingAutoPlayFallback.value = setTimeout(() => {
      if (pendingAutoPlay.value) {
        if (!advanceFallbackSource()) {
          pendingAutoPlay.value = false;
          waiting.value = false;
        }
      }
      pendingAutoPlayFallback.value = null;
    }, 4000);
  },
  { deep: true },
);

/**
 * Updates the current time and date based on the user's timezone.
 */
const updateCurrentTime = (): void => {
  currentTime.value = dayjs().tz($store.getTimezone).format("LTS");
  currentDate.value = dayjs().tz($store.getTimezone).format("LLLL");
};

// Update the current time every second
onMounted(() => {
  // Set the timezone based on the country.
  const [_, area, country] = props.country.split(".");
  $store.setTimezone(area, country.replace(/_/g, "-"));
  online.value = navigator.onLine;
  updateCurrentTime();
  timeInterval = setInterval(updateCurrentTime, 1000);

  // Select elements with the classes 'vds-play-button' and 'vds-button'
  document
    .querySelectorAll(".vds-play-button")
    .forEach((button) => button.classList.add("hidden"));

  /**
   * You can add these tracks using HTML as well.
   *
   * @example
   * ```html
   * <media-provider>
   *   <track label="..." src="..." kind="..." srclang="..." default />
   *   <track label="..." src="..." kind="..." srclang="..." />
   * </media-provider>
   * ```
   */

  // Subscribe to state updates - you can connect them to Vue refs if needed.
  unsubscribePlayerState = $player.value?.subscribe((state: Readonly<MediaPlayerState>) => {
    const { paused, error, canPlay, ended } = state;
    button.value = !paused;

    if (error) {
      streamError.value = true;
      button.value = false;
      waiting.value = false;
      scheduleReconnect();
    } else if (canPlay) {
      waiting.value = false;
      streamError.value = false;
      reconnectAttempts.value = 0;
      clearReconnectTimer();
    }

    if (ended && !userPaused.value) {
      scheduleReconnect();
    }
  });

  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);

  const autoPlayEnabled =
    import.meta.client &&
    localStorage.getItem("radio_autoplay_enabled") === "1";

  // Best effort autoplay when entering page.
  // If browser blocks autoplay, retry once user interacts anywhere.
  if (autoPlayEnabled) {
    pendingAutoPlay.value = true;
    waiting.value = true;
    onPlay();
  } else {
    waiting.value = false;
  }
});

onUnmounted(() => {
  clearReconnectTimer();
  if (timeInterval) {
    clearInterval(timeInterval);
    timeInterval = null;
  }
  unsubscribePlayerState?.();
  unsubscribePlayerState = undefined;
  if (pendingAutoPlayFallback.value) {
    clearTimeout(pendingAutoPlayFallback.value);
    pendingAutoPlayFallback.value = null;
  }
  removeAutoPlayUnlockListeners.value?.();
  window.removeEventListener("online", updateOnlineStatus);
  window.removeEventListener("offline", updateOnlineStatus);
});

/**
 * Handles the change of media provider.
 *
 * @param {MediaProviderChangeEvent} event - The event triggered when the media provider changes.
 */
function onProviderChange(event: MediaProviderChangeEvent) {
  const provider = event.detail;
  if (!provider) {
    waiting.value = true;
    return;
  }

  // We can configure provider's here.
  if (isHLSProvider(provider)) {
    provider.config = {};
  }

  // If the provider has no currentSrc or media not set, mark streamError so UI disables play
  const providerWithMedia = provider as Partial<{
    currentSrc: string;
    media: HTMLMediaElement | null;
  }>;

  if (!providerWithMedia.currentSrc || !providerWithMedia.media) {
    waiting.value = true;
    return;
  }

  streamError.value = false;
}

// We can listen for the `can-play` event to be notified when the player is ready.
function onCanPlay(_: MediaCanPlayEvent) {
  reconnectAttempts.value = 0;
  clearReconnectTimer();

  if (pendingAutoPlay.value) {
    if (pendingAutoPlayFallback.value) {
      clearTimeout(pendingAutoPlayFallback.value);
      pendingAutoPlayFallback.value = null;
    }
    // attempt to play now that player reports can-play
    $player.value
      ?.play()
      .then(() => {
        waiting.value = false;
        pendingAutoPlay.value = false;
      })
      .catch((err: unknown) => {
        console.error("Playback start failed:", err);
        waiting.value = false;
        pendingAutoPlay.value = false;
      });
  }
}
</script>

<style scoped>
.player {
  --brand-color: #ef4444;
  --focus-color: #4e9cf6;

  --audio-brand: var(--brand-color);
  --audio-focus-ring-color: var(--focus-color);
  --audio-border-radius: 2px;

  --video-brand: var(--brand-color);
  --video-focus-ring-color: var(--focus-color);
  --video-border-radius: 2px;

  /* 👉 https://vidstack.io/docs/player/components/layouts/default#css-variables for more. */
}

.player[data-view-type="audio"] media-poster {
  display: none;
}

.player[data-view-type="video"] {
  aspect-ratio: 16 /9;
}

.src-buttons {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  margin-top: 40px;
  margin-inline: auto;
  max-width: 300px;
}

.vds-audio-layout {
  border: unset !important;
}

:where(.vds-audio-layout) {
  filter: none;
  background-color: unset;
}
</style>
