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
    // In-memory lease metadata only: never persist a signed HLS URL or access key.
    globalRadioLease: null as null | {
      provider: 'apple-music';
      stationId: string;
      listenUrl: string;
      stationUrl: string;
      expiresAt: number;
    },
    // Global dock/mini state so the app shell does not reserve hidden dock space.
    playerMini: false,
    liveTrack: null as { stationUrl: string; title: string; artist: string } | null,
  }),
  actions: {
    activateGlobalRadio(station: PlaybackStation, listenUrl: string, expiresAt: number, stations: RadioStationOption[] = []) {
      // Country and Global share the same player/queue; only source resolution differs.
      this.liveTrack = null;
      this.station = station;
      this.stations = stations.length ? stations
        : [{ id: station.id, title: station.title, image: station.image, url: station.url }];
      this.globalRadioLease = {
        provider: 'apple-music',
        stationId: station.id,
        stationUrl: station.url,
        listenUrl,
        expiresAt,
      };
      this.requestedStationUrl = '';
      this.playRequest += 1;
    },
    refreshGlobalRadioStream(stationUrl: string, streamUrl: string, expiresAt: number) {
      if (!this.globalRadioLease || this.station?.url !== stationUrl
        || this.globalRadioLease.stationUrl !== stationUrl) return false;
      this.station = {
        ...this.station,
        sources: [{ src: streamUrl, type: 'application/vnd.apple.mpegurl', source: 'primary', label: 'Apple Music HLS' }],
      };
      this.globalRadioLease = { ...this.globalRadioLease, expiresAt };
      if (this.playing || this.waiting) this.playRequest += 1;
      return true;
    },
    setLiveTrack(stationUrl: string, track: { title: string; artist: string } | null) {
      if (!stationUrl || this.station?.url !== stationUrl) return;
      this.liveTrack = track ? { stationUrl, title: track.title, artist: track.artist } : null;
    },
    requestStation(url: string) {
      if (this.station?.url === url) this.playRequest += 1;
      else this.requestedStationUrl = url;
    },
    activate(station: PlaybackStation, stations: RadioStationOption[], options: { autoplay?: boolean; onlyIfIdle?: boolean } = {}) {
      if (options.onlyIfIdle && this.station) return;
      // Revisiting the same station or changing language must not reload audio.
      if (this.station?.url !== station.url) {
        this.liveTrack = null;
        this.globalRadioLease = null;
      }
      if (this.station?.url !== station.url || (!this.station?.sources.length && station.sources.length)) this.station = station;
      this.stations = stations;
      if (options.autoplay || this.requestedStationUrl === station.url) this.playRequest += 1;
      this.requestedStationUrl = '';
    },
  },
});
