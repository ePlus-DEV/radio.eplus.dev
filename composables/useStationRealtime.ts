import { usePlaybackStore } from '~/stores/playback';
import type { RadioProgram, RadioSong, RadioTrack } from '~/types/radio';
import { isZingScheduleUrl } from '~/utils/station-schedule.mjs';
import { getVietnamSchedule, vietnamReferencePrograms } from '~/utils/vietnam-schedules.mjs';
import { createStationPolling } from '~/utils/station-polling.mjs';
import { resolveLiveTrack } from '~/utils/live-track.mjs';

export function useStationRealtime() {
  const playback = usePlaybackStore();
  const config = useRuntimeConfig();
  const { t } = useI18n();
  const program = ref<RadioProgram[]>([]);
  const playlist = ref<RadioTrack[]>([]);
  const song = ref<RadioSong>();
  const lyrics = ref<string[]>([]);
  const lyricsOpen = ref(false);
  const loading = ref(false);
  let clientReady = false;

  const isZingStation = computed(() => isZingScheduleUrl(playback.station?.schedule));
  const referenceSchedule = computed(() => getVietnamSchedule(playback.station?.url));
  const scheduleSourceUrl = computed(() => referenceSchedule.value?.sourceUrl || '');
  const scheduleIsReference = computed(() => Boolean(referenceSchedule.value));
  const timestampUrl = (url: string) => /[?&](?:time|timestamp)=$/i.test(url) ? `${url}${Math.floor(Date.now() / 1000)}` : url;

  const fetchLyric = async (id: string, signal: AbortSignal): Promise<string[]> => {
    if (!import.meta.client) return [];
    if (!config.public.apiZingGetLyric) return [t('panel.no_lyric')];
    try {
      const result = await $fetch<{ err: number; data?: { sentences?: { words: { data: string }[] }[] } }>(
        `${config.public.apiZingGetLyric}${id}&time=${Math.floor(Date.now() / 1000)}`, { signal, timeout: 10_000 },
      );
      if (result.err === 0 && result.data?.sentences?.length) return result.data.sentences.map(s => s.words.map(w => w.data).join(' '));
    } catch (error) {
      if (signal.aborted) throw error;
    }
    return [t('panel.no_lyric')];
  };

  const fetchDetail = async (id: string, signal: AbortSignal) => {
    if (!import.meta.client) return {};
    if (!config.public.apiZingLiveStreamProgramDetail) return {};
    const result = await $fetch<{ err: number; data?: RadioSong }>(timestampUrl(
      `${config.public.apiZingLiveStreamProgramDetail}${id}&time=`,
    ), { signal, timeout: 10_000 });
    const currentSong = result.err === 0 ? result.data : undefined;
    const media = currentSong?.currentMedia;
    const lines = media?.hasLyric ? await fetchLyric(media.encodeId, signal) : [t('panel.no_lyric')];
    return { song: currentSong, lyrics: lines };
  };

  interface RealtimeData { program: RadioProgram[]; playlist: RadioTrack[]; song?: RadioSong; lyrics: string[] }
  const fetchSchedule = async (url: string, signal: AbortSignal): Promise<RealtimeData | undefined> => {
    if (!import.meta.client || !clientReady) return;
    const value = await $fetch<{ err?: number; success?: boolean; data?: { items?: RadioProgram[] }; result?: RadioTrack[] }>(timestampUrl(url), { signal, timeout: 10_000 });
    if (isZingScheduleUrl(url)) {
      const items = value.err === 0 ? value.data?.items || [] : [];
      const detail = items[0]?.encodeId ? await fetchDetail(items[0].encodeId, signal) : {};
      return { program: items, playlist: [], lyrics: [t('panel.no_lyric')], ...detail };
    }
    return { program: [], playlist: value.success && Array.isArray(value.result) ? value.result : [], lyrics: [] };
  };

  const polling = createStationPolling({
    load: fetchSchedule,
    onData: (value: RealtimeData | undefined) => {
      if (!value) return;
      program.value = value.program;
      playlist.value = value.playlist;
      song.value = value.song;
      lyrics.value = value.lyrics;
      playback.setLiveTrack(playback.station?.url || '', resolveLiveTrack(value.song, value.playlist));
    },
    onLoading: (value: boolean) => { loading.value = value; },
  });

  const activate = () => {
    // When the broadcaster provides a daily reference guide but no accessible
    // realtime EPG API, show its sourced time slots without fake network calls.
    program.value = vietnamReferencePrograms(playback.station?.url);
    playlist.value = [];
    song.value = undefined;
    playback.setLiveTrack(playback.station?.url || '', null);
    lyrics.value = [t('panel.updating')];
    lyricsOpen.value = false;
    if (!import.meta.client || !clientReady) return;
    polling.start(playback.station?.schedule || '');
  };
  watch(() => playback.station?.url, activate);
  let referenceTimer: ReturnType<typeof setInterval> | null = null;
  onMounted(() => {
    clientReady = true;
    activate();
    // Update the local Vietnam date at midnight; leave provider EPG polling
    // untouched and never reinitialize audio merely because the date changed.
    referenceTimer = setInterval(() => {
      const path = playback.station?.url;
      if (!referenceSchedule.value?.slots.length) return;
      const next = vietnamReferencePrograms(path);
      if (next[0]?.startTime !== program.value[0]?.startTime) program.value = next;
    }, 60_000);
  });
  onBeforeUnmount(() => {
    clientReady = false;
    polling.stop();
    if (referenceTimer) clearInterval(referenceTimer);
  });
  return { program, playlist, song, lyrics, lyricsOpen, loading, isZingStation, scheduleSourceUrl, scheduleIsReference };
}
