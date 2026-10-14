import { defineStore } from 'pinia';
import {
  LISTENING_DURATION_KEY,
  addListeningDurationAcrossDays,
  emptyListeningDuration,
  localDayKey,
  parseListeningDuration,
} from '~/utils/listening-duration.mjs';

export const useListeningDurationStore = defineStore('listeningDuration', {
  state: () => ({
    stats: emptyListeningDuration(),
    ready: false,
    // Live preview is not persisted: recorded checkpoints remain authoritative.
    activeStationUrl: '',
    liveMs: 0,
  }),
  getters: {
    todayMs: state => state.stats.todayKey === localDayKey() ? state.stats.todayMs : 0,
  },
  actions: {
    hydrate() {
      if (!import.meta.client || this.ready) return;
      try { this.stats = parseListeningDuration(localStorage.getItem(LISTENING_DURATION_KEY)); }
      catch { /* Blocked storage should not interrupt playback. */ }
      this.ready = true;
      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === LISTENING_DURATION_KEY || event.key === null) {
          this.stats = parseListeningDuration(event.newValue);
        }
      });
    },
    setLivePreview(stationUrl: string, elapsedMs: number) {
      this.activeStationUrl = stationUrl;
      this.liveMs = stationUrl && Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
    },
    record(station: { url: string; title: string; image: string; countryKey?: string } | null, durationMs: number) {
      if (!station || durationMs <= 0) return;
      this.hydrate();
      // Refresh from shared storage before adding time, so different tabs do
      // not blindly overwrite values from the previous write.
      if (import.meta.client) {
        try {
          const stored = localStorage.getItem(LISTENING_DURATION_KEY);
          if (stored) this.stats = parseListeningDuration(stored);
        } catch { /* Keep tracking in memory for this session. */ }
      }
      this.stats = addListeningDurationAcrossDays(this.stats, station, durationMs);
      if (import.meta.client) {
        try { localStorage.setItem(LISTENING_DURATION_KEY, JSON.stringify(this.stats)); }
        catch { /* Keep tracking in memory for this session. */ }
      }
    },
  },
});
