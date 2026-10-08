<template>
  <section class="flex h-full min-h-0 flex-col">
    <div class="border-b border-[var(--radio-border)] p-3">
      <div class="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/[0.06]">
        <button
          v-if="hasSchedule"
          type="button"
          class="rounded-lg px-3 py-2 text-xs font-semibold transition"
          :class="
            activeTab === 'schedule'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          "
          @click="activeTab = 'schedule'"
        >
          {{ $t("panel.schedule") }}
          <span class="ml-1 opacity-70">{{ scheduleCount }}</span>
        </button>

        <button
          v-if="hasStations"
          type="button"
          class="rounded-lg px-3 py-2 text-xs font-semibold transition"
          :class="
            activeTab === 'stations'
              ? 'bg-white text-slate-950 shadow-sm dark:bg-white/10 dark:text-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          "
          @click="activeTab = 'stations'"
        >
          {{ $t("panel.channels") }}
          <span class="ml-1 opacity-60">{{ stations.length }}</span>
        </button>
      </div>

      <div
        v-if="activeTab === 'stations' && hasStations"
        class="mt-2.5 flex items-center gap-2"
      >
        <span
          v-if="countryName"
          class="hidden shrink-0 rounded-lg border border-[var(--radio-border)] bg-[var(--radio-surface)] px-2.5 py-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 sm:inline-flex"
        >
          {{ countryName }}
        </span>

        <label class="relative min-w-0 flex-1">
          <span class="sr-only">{{ $t("panel.search_channels") }}</span>
          <svg
            viewBox="0 0 24 24"
            class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 fill-none stroke-slate-400"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6" stroke-width="1.8"></circle>
            <path d="m16 16 4 4" stroke-width="1.8" stroke-linecap="round"></path>
          </svg>
          <input
            v-model="query"
            type="search"
            class="h-9 w-full rounded-xl border border-[var(--radio-border)] bg-[var(--radio-surface)] pl-9 pr-3 text-xs text-[var(--radio-text)] outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:ring-2 focus:ring-rose-400/15"
            :placeholder="$t('panel.search_channels')"
          />
        </label>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto p-2.5">
      <div v-if="activeTab === 'stations' && hasStations" class="space-y-1">
        <button
          v-for="station in filteredStations"
          :key="station.id"
          type="button"
          class="group flex w-full min-w-0 items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition"
          :class="
            station.id === activeStationId
              ? 'bg-rose-50 ring-1 ring-inset ring-rose-100 dark:bg-rose-500/10 dark:ring-rose-400/10'
              : 'hover:bg-slate-100 dark:hover:bg-white/[0.04]'
          "
          @click="$emit('select-station', station)"
        >
          <span
            class="radio-themed-artwork flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--radio-border)] p-1.5"
          >
            <img
              loading="lazy"
              :src="station.image || thumb"
              :alt="station.title"
              class="max-h-full max-w-full object-contain"
            />
          </span>

          <span class="min-w-0 flex-1">
            <span
              class="block truncate text-sm font-semibold"
              :class="
                station.id === activeStationId
                  ? 'text-rose-700 dark:text-rose-200'
                  : 'text-slate-800 dark:text-slate-100'
              "
            >
              {{ station.title }}
            </span>
            <span class="mt-0.5 block truncate text-[11px] text-slate-400 dark:text-slate-500">
              {{ countryName || stationName }}
            </span>
          </span>

          <span
            v-if="station.id === activeStationId"
            class="inline-flex shrink-0 items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] text-rose-500"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
            Live
          </span>
          <span
            v-else
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--radio-border)] text-slate-500 transition group-hover:border-rose-200 group-hover:text-rose-500 dark:text-slate-400"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" class="ml-0.5 h-3.5 w-3.5 fill-current">
              <path d="M8 5.7v12.6c0 .85.92 1.38 1.66.95l9.85-6.3a1.1 1.1 0 0 0 0-1.9l-9.85-6.3A1.1 1.1 0 0 0 8 5.7Z"></path>
            </svg>
          </span>
        </button>

        <div
          v-if="filteredStations.length === 0"
          class="flex min-h-32 items-center justify-center px-5 text-center text-xs text-slate-400"
        >
          {{ $t("panel.no_channels") }}
        </div>
      </div>

      <div v-else-if="activeTab === 'schedule' && hasSchedule" class="space-y-1">
        <template v-if="program.length">
          <div
            v-for="(item, index) in program"
            :key="programKey(item, index)"
            class="grid grid-cols-[68px_minmax(0,1fr)] gap-3 rounded-xl px-2.5 py-2.5 transition"
            :class="
              index === 0
                ? 'bg-rose-50 ring-1 ring-inset ring-rose-100 dark:bg-rose-500/10 dark:ring-rose-400/10'
                : 'hover:bg-slate-100 dark:hover:bg-white/[0.04]'
            "
          >
            <div class="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">
              <template v-if="item.startTime">
                <div>{{ dayjs.unix(item.startTime).format("HH:mm") }}</div>
                <div
                  v-if="item.endTime"
                  class="mt-0.5 text-[10px] font-normal text-slate-400 dark:text-slate-500"
                >
                  {{ dayjs.unix(item.endTime).format("HH:mm") }}
                </div>
              </template>
              <template v-else>—</template>
            </div>

            <div class="min-w-0">
              <p
                class="truncate text-sm font-semibold"
                :class="
                  index === 0
                    ? 'text-rose-700 dark:text-rose-200'
                    : 'text-slate-800 dark:text-slate-100'
                "
              >
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
        </template>

        <template v-else>
          <div
            v-for="(item, index) in playlist"
            :key="playlistKey(item, index)"
            class="group flex min-w-0 items-center gap-3 rounded-xl px-2.5 py-2.5 transition"
            :class="
              index === 0
                ? 'bg-rose-50 ring-1 ring-inset ring-rose-100 dark:bg-rose-500/10 dark:ring-rose-400/10'
                : 'hover:bg-slate-100 dark:hover:bg-white/[0.04]'
            "
          >
            <div class="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-white/10">
              <img
                loading="lazy"
                :src="item.track_image || thumb"
                :alt="item.track_title || stationName"
                class="h-full w-full object-cover"
              />
            </div>

            <div class="min-w-0 flex-1">
              <p
                class="truncate text-sm font-semibold"
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
              class="shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] text-rose-500"
            >
              Live
            </span>
            <span
              v-else-if="item.track_played"
              class="shrink-0 text-[10px] text-slate-400 dark:text-slate-500"
            >
              {{ dayjs.unix(item.track_played).fromNow(true) }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { RadioStationOption } from "~/types/radio";

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
    stations?: RadioStationOption[];
    activeStationId?: string;
    thumb: string;
    stationName: string;
    countryName?: string;
  }>(),
  {
    playlist: () => [],
    program: () => [],
    stations: () => [],
    activeStationId: "",
    countryName: "",
  },
);

defineEmits<{
  (event: "select-station", station: RadioStationOption): void;
}>();

const query = ref("");
const hasStations = computed(() => props.stations.length > 0);
const hasSchedule = computed(
  () => props.playlist.length > 0 || props.program.length > 0,
);
const scheduleCount = computed(
  () => props.program.length || props.playlist.length,
);
const activeTab = ref<"stations" | "schedule">(
  hasStations.value ? "stations" : "schedule",
);

const filteredStations = computed(() => {
  const keyword = query.value.trim().toLocaleLowerCase();
  if (!keyword) return props.stations;

  return props.stations.filter((station) =>
    station.title.toLocaleLowerCase().includes(keyword),
  );
});

watch([hasStations, hasSchedule], ([stationsReady, scheduleReady]) => {
  if (activeTab.value === "stations" && !stationsReady && scheduleReady) {
    activeTab.value = "schedule";
  } else if (
    activeTab.value === "schedule" &&
    !scheduleReady &&
    stationsReady
  ) {
    activeTab.value = "stations";
  }
});

const playlistKey = (item: PlaylistItem, index: number): string =>
  [item.track_title, item.track_artist, item.track_played, index].join("-");

const programKey = (item: ProgramItem, index: number): string =>
  [item.encodeId, item.startTime, item.title, index].join("-");
</script>
