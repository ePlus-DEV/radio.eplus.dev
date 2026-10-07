<template>
  <section class="flex h-full min-h-0 flex-col">
    <div class="flex items-center justify-between border-b border-slate-200/80 px-4 py-3 dark:border-white/10">
      <div class="flex min-w-0 items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/[0.06]">
        <button
          v-if="hasPlaylist"
          type="button"
          class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
          :class="
            activeTab === 'playlist'
              ? 'bg-white text-slate-950 shadow-sm dark:bg-white/10 dark:text-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          "
          @click="activeTab = 'playlist'"
        >
          {{ $t("panel.playlist") }}
        </button>
        <button
          v-if="hasProgram"
          type="button"
          class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
          :class="
            activeTab === 'schedule'
              ? 'bg-white text-slate-950 shadow-sm dark:bg-white/10 dark:text-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          "
          @click="activeTab = 'schedule'"
        >
          {{ $t("panel.schedule") }}
        </button>
      </div>

      <span class="shrink-0 text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
        {{ activeCount }}
      </span>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto p-2.5">
      <div v-if="activeTab === 'playlist' && hasPlaylist" class="space-y-1">
        <div
          v-for="(item, index) in playlist"
          :key="playlistKey(item, index)"
          class="group flex min-w-0 items-center gap-3 rounded-xl px-2.5 py-2.5 transition"
          :class="
            index === 0
              ? 'bg-rose-50 ring-1 ring-inset ring-rose-100 dark:bg-rose-500/10 dark:ring-rose-400/10'
              : 'hover:bg-slate-50 dark:hover:bg-white/[0.04]'
          "
        >
          <div class="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-white/10">
            <img
              loading="lazy"
              :src="item.track_image || thumb"
              :alt="item.track_title || 'Track artwork'"
              class="h-full w-full object-cover"
            />
            <span
              v-if="index === 0"
              class="absolute inset-0 flex items-center justify-center bg-slate-950/35 text-white"
              aria-hidden="true"
            >
              <span class="flex h-4 items-end gap-[2px]">
                <span class="queue-bar h-1.5 w-[2px] rounded-full bg-current"></span>
                <span class="queue-bar h-3 w-[2px] rounded-full bg-current"></span>
                <span class="queue-bar h-2 w-[2px] rounded-full bg-current"></span>
              </span>
            </span>
          </div>

          <div class="min-w-0 flex-1">
            <p
              class="truncate text-sm font-medium"
              :class="
                index === 0
                  ? 'text-rose-700 dark:text-rose-200'
                  : 'text-slate-800 dark:text-slate-100'
              "
            >
              {{ item.track_title || $t("panel.updating") }}
            </p>
            <p class="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
              {{ item.track_artist || stationName }}
            </p>
          </div>

          <span
            v-if="index === 0"
            class="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-rose-500"
          >
            Live
          </span>
          <span
            v-else-if="item.track_played"
            class="shrink-0 text-[10px] text-slate-400 dark:text-slate-600"
          >
            {{ dayjs.unix(item.track_played).fromNow(true) }}
          </span>
        </div>
      </div>

      <div v-else-if="activeTab === 'schedule' && hasProgram" class="space-y-1">
        <div
          v-for="(item, index) in program"
          :key="programKey(item, index)"
          class="grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-xl px-2.5 py-2.5 transition"
          :class="
            index === 0
              ? 'bg-sky-50 ring-1 ring-inset ring-sky-100 dark:bg-sky-400/10 dark:ring-sky-300/10'
              : 'hover:bg-slate-50 dark:hover:bg-white/[0.04]'
          "
        >
          <div class="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">
            <template v-if="item.startTime">
              {{ dayjs.unix(item.startTime).format("HH:mm") }}
            </template>
            <template v-else>—</template>
          </div>
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
              {{ item.title || $t("panel.updating") }}
            </p>
            <p
              v-if="item.description"
              class="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-400 dark:text-slate-500"
            >
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-else
        class="flex min-h-40 flex-col items-center justify-center px-6 text-center"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/[0.06] dark:text-slate-500">
          <svg viewBox="0 0 24 24" class="h-5 w-5 fill-none stroke-current" aria-hidden="true">
            <path d="M5 7h11M5 12h11M5 17h7" stroke-width="1.8" stroke-linecap="round"></path>
            <path d="m16 15 4 2.5-4 2.5v-5Z" stroke-width="1.8" stroke-linejoin="round"></path>
          </svg>
        </div>
        <p class="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ $t("panel.playlist") }}
        </p>
        <p class="mt-1 text-xs leading-5 text-slate-400 dark:text-slate-500">
          {{ $t("panel.updating") }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const dayjs = useDayjs();

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

const props = withDefaults(
  defineProps<{
    playlist?: PlaylistItem[];
    program?: ProgramItem[];
    thumb: string;
    stationName: string;
  }>(),
  {
    playlist: () => [],
    program: () => [],
  },
);

const hasPlaylist = computed(() => props.playlist.length > 0);
const hasProgram = computed(() => props.program.length > 0);
const activeTab = ref<"playlist" | "schedule">(
  hasPlaylist.value ? "playlist" : "schedule",
);

watch([hasPlaylist, hasProgram], ([playlistReady, programReady]) => {
  if (activeTab.value === "playlist" && !playlistReady && programReady) {
    activeTab.value = "schedule";
  } else if (activeTab.value === "schedule" && !programReady && playlistReady) {
    activeTab.value = "playlist";
  }
});

const activeCount = computed(() =>
  activeTab.value === "playlist" ? props.playlist.length : props.program.length,
);

const playlistKey = (item: PlaylistItem, index: number): string =>
  [item.track_title, item.track_artist, item.track_played, index].join("-");

const programKey = (item: ProgramItem, index: number): string =>
  [item.encodeId, item.startTime, item.title, index].join("-");
</script>

<style scoped>
.queue-bar:nth-child(1) {
  animation: queue-eq 0.72s ease-in-out infinite alternate;
}

.queue-bar:nth-child(2) {
  animation: queue-eq 0.56s ease-in-out 0.1s infinite alternate;
}

.queue-bar:nth-child(3) {
  animation: queue-eq 0.68s ease-in-out 0.18s infinite alternate;
}

@keyframes queue-eq {
  from { transform: scaleY(0.4); }
  to { transform: scaleY(1); }
}
</style>
