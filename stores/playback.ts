import { defineStore } from 'pinia';
import type { PlaybackStation, RadioStationOption } from '~/types/radio';

export const usePlaybackStore = defineStore('playback', {
  state: () => ({
    station: null as PlaybackStation | null,
    stations: [] as RadioStationOption[],
    playRequest: 0,
    pauseRequest: 0,
    playing: false,
    waiting: false,
    queueOpen: true,
  }),
  actions: {
    activate(station: PlaybackStation, stations: RadioStationOption[], options: { autoplay?: boolean; onlyIfIdle?: boolean } = {}) {
      if (options.onlyIfIdle && this.station) return;
      // Revisiting the same station or changing language must not reload audio.
      if (this.station?.url !== station.url) this.station = station;
      this.stations = stations;
      if (options.autoplay) this.playRequest += 1;
    },
  },
});
