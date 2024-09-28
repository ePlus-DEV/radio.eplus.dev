<template>
  <div>
    <div class="transform -rotate-1 pb-8">
      <!-- BEGIN - Player -->
      <div
        class="flex bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden mx-auto"
      >
        <div class="flex flex-col w-full">
          <div class="flex items-center p-5 border-b dark:border-gray-600">
            <div class="flex justify-around">
              <span class="relative inline-flex">
                <nuxt-img
                  loading="lazy"
                  class="w-35 h-25 object-cover"
                  src="https://radio.eplus.dev/img/europe/flags/united-kingdom.png"
                />
                <span class="flex absolute h-3 w-3 top-0 right-0 -mt-1 -mr-1">
                  <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
                  ></span>
                  <span
                    class="relative inline-flex rounded-full h-3 w-3 bg-red-500"
                  ></span>
                </span>
              </span>
            </div>

            <div class="flex flex-col px-2 w-full">
              <span
                class="text-xs text-gray-700 dark:text-white uppercase font-medium"
              >
                {{ $t("panel.play_from_radio") }}
              </span>
              <span
                class="text-sm text-red-500 dark:text-white capitalize font-semibold pt-1"
              >
                C-Pop Radio - Zing MP3
              </span>
              <span class="text-xs text-gray-500 uppercase font-medium">
                Việt Nam
              </span>
            </div>
            <div class="flex">
              <fa
                :icon="['fal', 'bookmark']"
                class="text-black dark:text-slate-500"
              />
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-center p-5">
            <div class="flex items-center">
              <div class="flex space-x-3 p-2">
                <button class="focus:outline-none cursor-not-allowed">
                  <svg
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6b7280"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polygon points="19 20 9 12 19 4 19 20"></polygon>
                    <line x1="5" y1="19" x2="5" y2="5"></line>
                  </svg>
                </button>
                <!-- BEIGN - Button Pause -->
                <button
                  v-show="!waiting"
                  class="transform hover:scale-125 cursor-not-allowed"
                  :class="[!button ? 'hidden' : '']"
                  @click="onPause"
                >
                  <svg width="50" height="50" fill="none">
                    <circle
                      class="text-gray-300 dark:text-gray-500"
                      cx="25"
                      cy="25"
                      r="24"
                      :stroke="streamError ? '#6b7280' : '#ef4444'"
                      stroke-width="1.5"
                    />
                    <path
                      d="M18 16h4v18h-4V16zM28 16h4v18h-4z"
                      :fill="streamError ? '#6b7280' : '#ef4444'"
                    />
                  </svg>
                </button>
                <!-- END - Button Pause -->
                <!-- END - Button Play -->
                <button
                  v-show="!waiting"
                  type="button"
                  class="transform hover:scale-125"
                  :class="[
                    button ? 'hidden' : '',
                    streamError ? 'cursor-not-allowed' : '',
                  ]"
                  @click="onPlay"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="50"
                    height="50"
                    viewBox="0 0 50 50"
                    :style="{ fill: streamError ? '#6b7280' : '#ef4444' }"
                  >
                    <path
                      d="M 7.3847656 1 C 6.4461117 1 5.5415977 1.3405474 4.921875 2.0078125 C 4.3021523 2.6750776 4 3.6068401 4 4.6347656 L 4 45.363281 C 4 46.391594 4.3021532 47.324738 4.921875 47.992188 C 5.5415968 48.659636 6.4461117 49 7.3847656 49 C 8.3762396 49 9.2122771 48.715937 10.015625 48.251953 L 28.146484 37.875 L 32.5 35.384766 L 44.769531 28.361328 L 44.771484 28.361328 C 45.865386 27.730994 47 26.626492 47 25 C 47 23.374065 45.86621 22.267775 44.767578 21.636719 L 42.203125 20.162109 C 39.90096 12.564756 32.841808 7.0195313 24.5 7.0195312 C 23.002786 7.0195312 21.554957 7.2177954 20.160156 7.5546875 L 10.015625 1.7480469 C 9.2129723 1.2838219 8.3762396 1 7.3847656 1 z M 7.3847656 3 C 8.0612916 3 8.3743246 3.1106937 9.0136719 3.4804688 L 9.015625 3.4804688 L 17.574219 8.3769531 C 10.796043 11.124024 6 17.76442 6 25.519531 C 6 32.87687 10.305274 39.237376 16.539062 42.214844 L 9.0175781 46.519531 L 9.015625 46.519531 C 8.3749698 46.889548 8.0612916 47 7.3847656 47 C 6.8924196 47 6.6032001 46.86191 6.3886719 46.630859 C 6.1741437 46.399809 6 46.012969 6 45.363281 L 6 25.519531 L 6 4.6347656 C 6 3.9856912 6.1741445 3.6001256 6.3886719 3.3691406 C 6.6031992 3.1381557 6.8924196 3 7.3847656 3 z M 24.5 9.0195312 C 33.624562 9.0195312 41 16.394969 41 25.519531 C 41 26.493839 40.896196 27.440628 40.734375 28.367188 L 35.542969 31.337891 C 36.468902 29.593602 37 27.608349 37 25.5 C 37 18.608285 31.391715 13 24.5 13 C 17.608285 13 12 18.608285 12 25.5 C 12 32.206368 17.315024 37.682153 23.951172 37.972656 L 18.708984 40.972656 C 12.45608 38.628715 8 32.602733 8 25.519531 C 8 16.394969 15.375438 9.0195314 24.5 9.0195312 z M 24.5 15 C 30.310835 15 35 19.689165 35 25.5 C 35 31.310835 30.310835 36 24.5 36 C 18.689165 36 14 31.310835 14 25.5 C 14 19.689165 18.689165 15 24.5 15 z M 25 19 L 25 26.044922 C 24.6 25.815922 24.14225 25.673828 23.65625 25.673828 C 22.17025 25.673828 21 26.875937 21 28.335938 C 21 29.825937 22.168 31 23.625 31 C 25.111 31 26.5 29.836 26.5 28.375 L 26.5 21.875 L 29 21.875 L 29 19 L 25 19 z M 42.777344 22.798828 L 43.771484 23.371094 C 44.594852 23.844038 45 24.229935 45 25 C 45 25.769508 44.595488 26.153287 43.773438 26.626953 L 42.927734 27.111328 C 42.972432 26.586102 43 26.055979 43 25.519531 C 43 24.592654 42.909399 23.689399 42.777344 22.798828 z"
                    ></path>
                  </svg>
                </button>
                <!-- END - Button Play -->
                <!-- Waiting -->
                <svg
                  v-show="waiting"
                  class="animate-spin -ml-1 mr-3 text-red-500"
                  width="50"
                  height="50"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <!-- Waiting -->
                <button class="focus:outline-none cursor-not-allowed">
                  <svg
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6b7280"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polygon points="5 4 15 12 5 20 5 4"></polygon>
                    <line x1="19" y1="5" x2="19" y2="19"></line>
                  </svg>
                </button>
              </div>
            </div>
            <div class="relative w-full ml-2">
              <media-player
                class="player"
                title="Sprite Fight"
                :src="$src"
                crossOrigin
                playsInline
                @provider-change="onProviderChange"
                @can-play="onCanPlay"
                ref="$player"
                autoplay
                view-type="audio"
              >
                <media-provider>
                  <!-- <media-poster
                                class="vds-poster"
                                src="https://files.vidstack.io/sprite-fight/poster.webp"
                                alt="Girl walks into campfire with gnomes surrounding her friend ready for their next meal!"
                                /> -->
                </media-provider>
                <!-- Layouts -->
                <media-audio-layout></media-audio-layout>

                <!-- <VideoLayout thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt" /> -->

                <!-- <media-video-layout thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt" /> -->
              </media-player>
            </div>
          </div>

          <!-- BEGIN: Guide -->
          <div
            v-if="!button"
            class="flex bg-red-100 rounded-lg p-4 text-sm text-red-700"
            role="alert"
          >
            <svg
              class="w-5 h-5 inline mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <div>
              <span class="font-medium">{{ $t("text.guide") }}:</span>
              {{ $t("alert.play_button") }}
            </div>
          </div>
          <!-- END: Guide -->
        </div>
      </div>

      <div class="src-buttons">
        <button @click="changeSource('audio')">Audio</button>
        <button @click="changeSource('video')">Video</button>
        <button @click="changeSource('hls')">HLS</button>
        <button @click="changeSource('youtube')">YouTube</button>
        <button @click="changeSource('vimeo')">Vimeo</button>
      </div>
    </div>
  </div>
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

const props = defineProps([
  "country",
  "home",
  "info",
  "playlist",
  "song",
  "program",
  "thumb",
  "current",
]);

const $player = ref<MediaPlayerElement>(),
  $src = ref<MediaPlayerElement["src"]>(),
  waiting = ref(true),
  streamError = ref(false),
  button = ref(true);

/**
 * Handles the play action for the player.
 * If the player is not currently waiting, it will start playing and set a waiting state.
 * The waiting state is reset after a simulated waiting time of 1 second.
 */
function onPlay() {
  if (!waiting.value && !streamError.value) {
    $player.value?.play();
    waiting.value = true;
    setTimeout(() => {
      waiting.value = false;
    }, 1000); // Simulate waiting time
  }
}

/**
 * Pauses the player if it is not already waiting.
 *
 * This function checks if the player is currently not in a waiting state.
 * If not, it pauses the player and sets the waiting state to true.
 * After a simulated waiting time of 1 second, it resets the waiting state to false.
 */
function onPause() {
  if (!waiting.value) {
    $player.value?.pause();
    waiting.value = true;
    setTimeout(() => {
      waiting.value = false;
    }, 1000); // Simulate waiting time
  }
}

// Initialize src.
changeSource("audio");

onMounted(() => {
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
  $player.value?.subscribe((state: Readonly<MediaPlayerState>) => {
    const { paused, error } = state;
    button.value = !paused;
    streamError.value = Boolean(error);
    console.log("is paused?", "->", paused);
    if (error) {
      console.error("Playback error occurred");
    }
    waiting.value = false;
  });
});

/**
 * Handles the change of media provider.
 *
 * @param {MediaProviderChangeEvent} event - The event triggered when the media provider changes.
 */
function onProviderChange(event: MediaProviderChangeEvent) {
  const provider = event.detail;
  // We can configure provider's here.
  if (isHLSProvider(provider)) {
    provider.config = {};
  }
}

// We can listen for the `can-play` event to be notified when the player is ready.
function onCanPlay(event: MediaCanPlayEvent) {
  console.log("Can play", event.detail);
}
/**
 * Changes the source of the player based on the provided type.
 *
 * @param {string} type - The type of source to switch to.
 */
function changeSource(type: string) {
  switch (type) {
    case "audio":
      $src.value = {
        src: "https://media-ssl.musicradio.com/HeartUK",
        type: "audio/mp3",
      };
      break;
    case "video":
      $src.value = "https://files.vidstack.io/sprite-fight/720p.mp4";
      break;
    case "hls":
      $src.value =
        "https://multi-playlist-zmp3.zmdcdn.me/TgLpe29pVg0/zhls/playback-realtime/e75e51f26db784e9dda6/index.m3u8";
      break;
    case "youtube":
      $src.value = "youtube/_cMxraX_5RE";
      break;
    case "vimeo":
      $src.value = "vimeo/640499893";
      break;
    default:
      $src.value = "https://media-ssl.musicradio.com/HeartUK";
      break;
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

:where(.vds-audio-layout) {
  filter: none;
  background-color: unset;
}
</style>
