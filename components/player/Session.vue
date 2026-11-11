<template>
  <Player
    :country="station?.countryKey || ''"
    :country-name="station ? $t(station.countryKey) : playback.pendingGlobalRadio ? $t('global_radio.title') : ''"
    :thumb="station?.image || playback.pendingGlobalRadio?.image || ''"
    :stream-name="station?.title || playback.pendingGlobalRadio?.title || $t('player.choose_station')"
    :stream-url="station?.sources[0] || emptySource"
    :stream-urls="station?.sources || emptySources"
    :station-url="station?.url"
    :active-station-id="station?.id"
    :stations="playback.stations"
    :play-request="playback.playRequest"
    :pause-request="playback.pauseRequest"
    :program="program"
    :playlist="playlist"
    :song="song"
    :queue-loading="loading"
    :schedule-source-url="scheduleSourceUrl"
    :schedule-is-reference="scheduleIsReference"
    :lyrics-available="isZingStation"
    @select-station="selectStation"
    @open-lyrics="lyricsOpen = true"
  />
  <UModal v-model:open="lyricsOpen" :title="$t('panel.lyric')" :description="station?.title" :ui="{ content: 'max-w-xl', body: 'radio-scrollbar max-h-[60dvh] overflow-y-auto' }">
    <template #body>
      <p v-for="(line, index) in lyrics" :key="index" dir="auto" class="py-2 text-sm leading-7 text-[var(--radio-text-muted)]">{{ line }}</p>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePlaybackStore } from '~/stores/playback';
import { createPlaybackStation } from '~/utils/playback-station.mjs';
import type { RadioSource, RadioStationOption, RadioCatalogEntry } from '~/types/radio';
import type { GlobalRadioProvider } from '~/types/global-radio';

const playback = usePlaybackStore();
useRestoreLastStation();
const config = useRuntimeConfig();
const { station } = storeToRefs(playback);
const { program, playlist, song, lyrics, lyricsOpen, loading, isZingStation, scheduleSourceUrl, scheduleIsReference } = useStationRealtime();
const emptySource: RadioSource = { src: '', type: 'audio/mpeg' };
const emptySources: RadioSource[] = [];

// The dock and queue stay mounted across route changes. A Global Play action
// must resolve the signed HLS here, not navigate to a station detail page as
// the country queue does. Keep public metadata in this session only.
const siteAssetUrl = useSiteAssetUrl();
let globalCatalog: GlobalRadioProvider | null = null;
let globalCatalogRequest: Promise<GlobalRadioProvider> | null = null;
let selectionVersion = 0;
const { play: playGlobalRadio } = useAuthorizedGlobalRadioPlayback(
  () => globalCatalog?.stations || [],
);

const selectGlobalStation = async (target: RadioStationOption, version: number, previousUrl: string, previousRequested: string) => {
  try {
    // Fetch the public catalog only on an explicit Play/Next/Previous gesture.
    // Reuse the in-flight lookup when the listener taps more than once, and
    // retry a failed catalog request on the next user gesture.
    const provider = await (globalCatalogRequest ||= $fetch<GlobalRadioProvider>(
      siteAssetUrl('/catalog/providers/apple-music.json'), { timeout: 10_000 },
    ).catch(error => {
      globalCatalogRequest = null;
      throw error;
    }));
    if (version !== selectionVersion || playback.station?.url !== previousUrl
      || playback.requestedStationUrl !== previousRequested
      || (playback.globalRadioPendingId && playback.globalRadioPendingId !== target.id)) return;
    globalCatalog = provider;
    const chosen = provider.stations?.find(item => '/global-radio/apple-music/' + item.id === target.url);
    if (!chosen) {
      playback.globalRadioError = 'unavailable';
      return;
    }
    // The app-scoped resolver handles fresh leases and races. It never
    // requires a route change and never reuses an expired accessKey.
    await playGlobalRadio(chosen);
  } catch {
    if (version === selectionVersion) playback.globalRadioError = 'unavailable';
  }
};

const resolveCountryStationInPlace = async (target: RadioStationOption): Promise<boolean> => {
  if (!target.url) return false;
  const [, area, country, id] = target.url.split('/');
  if (!area || !country || !id) return false;
  try {
    const catalog = await $fetch<Record<string, RadioCatalogEntry>>(
      siteAssetUrl(`/radio/${area}/${country}.json`), { timeout: 10_000 },
    );
    const meta = catalog?.[id];
    if (!meta?.stream) return false;
    const options: RadioStationOption[] = Object.entries(catalog).map(([key, entry]) => ({
      id: key, title: entry.title, image: entry.features || '/brand/onair-mark.svg', url: `/${area}/${country}/${key}`,
    }));
    playback.activate(createPlaybackStation({
      area, country, id, meta,
      corsServer: String(config.public.corsServer || ''), placeholder: '/brand/onair-mark.svg',
    }), options, { autoplay: true });
    return playback.station?.url === target.url && Boolean(playback.station.sources.length);
  } catch {
    return false;
  }
};

const selectStation = (target: RadioStationOption) => {
  if (!target.url) return;
  const version = ++selectionVersion;
  if (target.url.startsWith('/global-radio/apple-music/')) {
    void selectGlobalStation(target, version, playback.station?.url || '', playback.requestedStationUrl);
    return;
  }

  // Restored country station with no sources (reload): resolve in place on
  // Play instead of navigating to its own detail route. Mirrors the Global
  // resolve-on-Play path; a failed catalog fetch falls back to navigation.
  if (target.url === playback.station?.url && !playback.station?.sources?.length
    && !target.url.startsWith('/global-radio/')) {
    void (async () => {
      const resolved = await resolveCountryStationInPlace(target);
      if (resolved) return;
      if (version !== selectionVersion) return;
      playback.requestStation(target.url!);
      void navigateTo(target.url!);
    })();
    return;
  }

  // Country queue navigation remains unchanged: it prepares the explicit
  // request before the target Country detail route loads its stream catalog.
  playback.requestStation(target.url);
  void navigateTo(target.url);
};
</script>
