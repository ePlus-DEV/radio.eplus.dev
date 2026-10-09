import { defineStore } from 'pinia';
import type { PlaybackStation, RadioStationOption } from '~/types/radio';

export const usePlaybackStore = defineStore('playback', {
  state: () => ({
    station: null as PlaybackStation | null,
    stations: [] as RadioStationOption[],
    playRequest: 0,
    requestedStationUrl: '',
    pauseRequest: 0,
    playing: false,
    waiting: false,
    queueOpen: false,
  }),
  actions: {
    requestStation(url: string) {
      if (this.station?.url === url) this.playRequest += 1;
      else this.requestedStationUrl = url;
    },
    activate(station: PlaybackStation, stations: RadioStationOption[], options: { autoplay?: boolean; onlyIfIdle?: boolean } = {}) {
      if (options.onlyIfIdle && this.station) return;
      // Revisiting the same station or changing language must not reload audio.
      if (this.station?.url !== station.url) this.station = station;
      this.stations = stations;
      if (options.autoplay || this.requestedStationUrl === station.url) this.playRequest += 1;
      this.requestedStationUrl = '';
    },
  },
});
