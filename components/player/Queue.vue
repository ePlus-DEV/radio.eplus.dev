<template>
  <section class="flex h-full min-h-0 flex-col">
    <div class="border-b border-[var(--radio-border)] p-3">
      <div
        v-if="hasSchedule && hasStations"
        role="tablist"
        class="grid w-full grid-cols-2 gap-1 rounded-xl bg-[var(--radio-surface-soft)] p-1"
        aria-label="Player sidebar"
      >
        <button
          type="button"
          role="tab"
          class="flex items-center justify-center h-8 min-h-8 rounded-lg px-3 text-xs font-semibold transition"
          :class="
            activeTab === 'schedule'
              ? 'bg-[var(--radio-surface)] !text-[var(--radio-text)] ring-1 ring-inset ring-[var(--radio-border)] shadow-sm'
              : 'text-[var(--radio-text-muted)] hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]'
          "
          :aria-selected="activeTab === 'schedule'"
          @click="activeTab = 'schedule'"
        >
          <span
            v-if="activeTab === 'schedule'"
            class="h-1.5 w-1.5 rounded-full bg-rose-500"
            aria-hidden="true"
          ></span>
          {{ $t("panel.schedule") }}
          <span
            class="ml-1 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums"
            :class="
              activeTab === 'schedule'
                ? 'bg-rose-500/10 text-rose-500'
                : 'bg-[var(--radio-hover)] text-[var(--radio-text-muted)]'
            "
          >
            {{ scheduleCount }}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          class="flex items-center justify-center h-8 min-h-8 rounded-lg px-3 text-xs font-semibold transition"
          :class="
            activeTab === 'stations'
              ? 'bg-[var(--radio-surface)] !text-[var(--radio-text)] ring-1 ring-inset ring-[var(--radio-border)] shadow-sm'
              : 'text-[var(--radio-text-muted)] hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]'
          "
          :aria-selected="activeTab === 'stations'"
          @click="activeTab = 'stations'"
        >
          <span
            v-if="activeTab === 'stations'"
            class="h-1.5 w-1.5 rounded-full bg-rose-500"
            aria-hidden="true"
          ></span>
          {{ $t("panel.channels") }}
          <span
            class="ml-1 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums"
            :class="
              activeTab === 'stations'
                ? 'bg-rose-500/10 text-rose-500'
                : 'bg-[var(--radio-hover)] text-[var(--radio-text-muted)]'
            "
          >
            {{ stations.length }}
          </span>
        </button>
      </div>

      <div
        v-else
        class="flex h-9 items-center justify-between rounded-xl border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] px-3"
      >
        <span class="truncate text-xs font-semibold text-[var(--radio-text)]">
          {{ hasStations ? $t("panel.channels") : $t("panel.schedule") }}
        </span>
        <span class="inline-flex items-center rounded-full border-0 bg-rose-500/10 text-[10px] font-bold text-rose-500">
          {{ hasStations ? stations.length : scheduleCount }}
        </span>
      </div>

      <div
        v-if="activeTab === 'stations' && hasStations"
        class="mt-2.5 flex items-center gap-2"
      >
        <span
          v-if="countryName"
          class="hidden items-center rounded-full border h-9 shrink-0 border-[var(--radio-border)] bg-[var(--radio-surface)] px-2.5 text-[11px] font-semibold text-[var(--radio-text-muted)] sm:inline-flex"
        >
          {{ countryName }}
        </span>

        <label
          class="flex h-9 min-h-9 min-w-0 flex-1 items-center gap-2 rounded-xl border-[var(--radio-border)] bg-[var(--radio-surface)] px-3 shadow-none outline-none transition focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-400/15"
        >
          <span class="sr-only">{{ $t("panel.search_channels") }}</span>
          <svg
            viewBox="0 0 24 24"
            class="h-3.5 w-3.5 shrink-0 fill-none stroke-slate-400"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6" stroke-width="1.8"></circle>
            <path d="m16 16 4 4" stroke-width="1.8" stroke-linecap="round"></path>
          </svg>
          <input
            v-model="query"
            type="search"
            class="min-w-0 grow bg-transparent p-0 text-xs text-[var(--radio-text)] outline-none placeholder:text-[var(--radio-text-muted)]"
            :placeholder="$t('panel.search_channels')"
          />
        </label>
      </div>
    </div>

    <div class="radio-scrollbar min-h-0 flex-1 overflow-y-auto p-2.5">
      <div v-if="activeTab === 'stations' && hasStations" class="space-y-1">
        <button
          v-for="station in filteredStations"
          :key="station.id"
          type="button"
          class="group flex w-full min-w-0 items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition"
          :class="
            station.id === activeStationId
              ? 'bg-rose-500/10 ring-1 ring-inset ring-rose-500/15'
              : 'hover:bg-[var(--radio-hover)]'
          "
          @click="$emit('select-station', station)"
        >
          <span
            class="radio-themed-artwork flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--radio-border)] p-1.5"
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
              dir="auto"
              class="block truncate text-sm font-semibold"
              :class="
                station.id === activeStationId
                  ? 'text-rose-600 dark:text-rose-300'
                  : 'text-[var(--radio-text)]'
              "
            >
              {{ station.title }}
            </span>
            <span class="mt-0.5 block truncate text-[11px] text-[var(--radio-text-muted)]">
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
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--radio-border)] text-[var(--radio-text-muted)] transition group-hover:border-rose-200 group-hover:text-rose-500"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" class="ml-0.5 h-3.5 w-3.5 fill-current">
              <path d="M8 5.7v12.6c0 .85.92 1.38 1.66.95l9.85-6.3a1.1 1.1 0 0 0 0-1.9l-9.85-6.3A1.1 1.1 0 0 0 8 5.7Z"></path>
            </svg>
          </span>
        </button>

        <div
          v-if="filteredStations.length === 0"
          class="flex min-h-32 items-center justify-center px-5 text-center text-xs text-[var(--radio-text-muted)]"
        >
          {{ $t("panel.no_channels") }}
        </div>
      </div>

      <div v-else-if="activeTab === 'schedule' && hasSchedule" class="space-y-1">
        <template v-if="program.length">
          <div
            v-for="(item, index) in program"
            :key="programKey(item, index)"
            class="relative grid grid-cols-[72px_minmax(0,1fr)] gap-3 overflow-hidden rounded-xl px-2.5 py-2.5 transition"
            :class="
              index === 0
                ? 'bg-[var(--radio-surface-soft)] ring-1 ring-inset ring-[var(--radio-border)]'
                : 'hover:bg-[var(--radio-hover)]'
            "
          >
            <span
              v-if="index === 0"
              class="absolute inset-y-2 left-0 w-0.5 rounded-full bg-rose-500"
              aria-hidden="true"
            ></span>

            <div
              class="rounded-lg bg-[var(--radio-surface)] px-2 py-1.5 text-xs font-semibold tabular-nums text-[var(--radio-text)] ring-1 ring-inset ring-[var(--radio-border)]"
            >
              <template v-if="item.startTime">
                <div>{{ dayjs.unix(item.startTime).format("HH:mm") }}</div>
                <div
                  v-if="item.endTime"
                  class="mt-0.5 text-[10px] font-normal text-[var(--radio-text-muted)]"
                >
                  {{ dayjs.unix(item.endTime).format("HH:mm") }}
                </div>
              </template>
              <template v-else>—</template>
            </div>

            <div class="min-w-0">
              <p
                dir="auto"
                class="truncate text-sm font-semibold text-[var(--radio-text)]"
              >
                {{ item.title || $t("panel.updating") }}
              </p>
              <p
                v-if="item.description"
                dir="auto"
                class="mt-0.5 line-clamp-2 text-xs leading-5 text-[var(--radio-text-muted)]"
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
            class="group relative flex min-w-0 items-center gap-3 overflow-hidden rounded-xl px-2.5 py-2.5 transition"
            :class="
              index === 0
                ? 'bg-[var(--radio-surface-soft)] ring-1 ring-inset ring-[var(--radio-border)]'
                : 'hover:bg-[var(--radio-hover)]'
            "
          >
            <span
              v-if="index === 0"
              class="absolute inset-y-2 left-0 w-0.5 rounded-full bg-rose-500"
              aria-hidden="true"
            ></span>

            <div class="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[var(--radio-surface)] ring-1 ring-inset ring-[var(--radio-border)]">
              <img
                loading="lazy"
                :src="item.track_image || thumb"
                :alt="item.track_title || stationName"
                class="h-full w-full object-cover"
              />
            </div>

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-[var(--radio-text)]">
                {{ item.track_title || $t("panel.updating") }}
              </p>
              <p class="mt-0.5 truncate text-xs text-[var(--radio-text-muted)]">
                {{ item.track_artist || stationName }}
              </p>
            </div>

            <span
              v-if="index === 0"
              class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-rose-500"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
              Live
            </span>
            <span
              v-else-if="item.track_played"
              class="shrink-0 text-[10px] text-[var(--radio-text-muted)]"
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
    scheduleLoading?: boolean;
  }>(),
  {
    playlist: () => [],
    program: () => [],
    stations: () => [],
    activeStationId: "",
    countryName: "",
    scheduleLoading: false,
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
const preferScheduleAfterLoad = ref(false);

const filteredStations = computed(() => {
  const keyword = query.value.trim().toLocaleLowerCase();
  if (!keyword) return props.stations;

  return props.stations.filter((station) =>
    station.title.toLocaleLowerCase().includes(keyword),
  );
});

watch(
  () => props.activeStationId,
  () => {
    query.value = "";
    preferScheduleAfterLoad.value = false;
    activeTab.value = hasStations.value ? "stations" : "schedule";
  },
  { flush: "sync" },
);

watch(
  () => props.scheduleLoading,
  (loading, wasLoading) => {
    if (loading) {
      preferScheduleAfterLoad.value = true;
      return;
    }

    if (
      wasLoading &&
      preferScheduleAfterLoad.value &&
      hasSchedule.value
    ) {
      activeTab.value = "schedule";
      preferScheduleAfterLoad.value = false;
    }
  },
);

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
