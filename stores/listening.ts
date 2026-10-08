import { defineStore } from 'pinia';
import { LISTENING_LIBRARY_KEY, emptyListeningLibrary, parseListeningLibrary, rememberStation, toggleFavoriteStation } from '~/utils/listening-library.mjs';
import type { PlaybackStation } from '~/types/radio';

export const useListeningStore = defineStore('listening', {
  state: () => ({ library: emptyListeningLibrary(), ready: false }),
  actions: {
    hydrate() {
      if (!import.meta.client || this.ready) return;
      try { this.library = parseListeningLibrary(localStorage.getItem(LISTENING_LIBRARY_KEY)); } catch { /* Storage may be disabled. */ }
      this.ready = true;
    },
    save() {
      if (!import.meta.client) return;
      try { localStorage.setItem(LISTENING_LIBRARY_KEY, JSON.stringify(this.library)); } catch { /* Keep the current session usable. */ }
    },
    remember(station: PlaybackStation | null, state: 'play' | 'pause', heard = false) {
      this.hydrate();
      this.library = rememberStation(this.library, station, state, heard);
      this.save();
    },
    toggleFavorite(station: { url: string; title: string; image: string; countryKey?: string }) {
      this.hydrate();
      this.library = toggleFavoriteStation(this.library, station);
      this.save();
    },
    clearRecent() { this.library.recent = []; this.save(); },
  },
});
