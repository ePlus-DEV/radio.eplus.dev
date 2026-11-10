import test from 'node:test';
import assert from 'node:assert/strict';
import { createPinia, setActivePinia } from 'pinia';
import { usePlaybackStore } from '../stores/playback.ts';
import {
  canRestoreSavedStationOnRoute, createAuthorizedApplePlaybackStation,
  createAppleRadioQueue,
} from '../utils/global-radio-station.mjs';

const hits = {
  id: 'apple-music-hits',
  title: 'Apple Music Hits',
  image: '/img/global-radio/apple-music-hits.png',
};
const hitsPath = '/global-radio/apple-music/apple-music-hits';

test('reload may restore the last Apple Music Hits deep link, but not a different station', () => {
  assert.equal(canRestoreSavedStationOnRoute(hitsPath, hitsPath), true);
  assert.equal(canRestoreSavedStationOnRoute(hitsPath, hitsPath + '/'), true);
  assert.equal(canRestoreSavedStationOnRoute(hitsPath, '/'), true);
  assert.equal(canRestoreSavedStationOnRoute(hitsPath, '/global-radio/apple-music'), true);
  assert.equal(canRestoreSavedStationOnRoute(hitsPath, '/global-radio/apple-music/apple-music-1'), false);
  assert.equal(canRestoreSavedStationOnRoute(hitsPath, '/asia/viet-nam/vov1'), false);
  assert.equal(canRestoreSavedStationOnRoute('/asia/viet-nam/vov1', '/asia/viet-nam/vov1'), false);
  assert.equal(canRestoreSavedStationOnRoute(hitsPath, undefined), false);
});

test('restored Apple Music Hits keeps metadata without a persisted or playable HLS URL', () => {
  setActivePinia(createPinia());
  const playback = usePlaybackStore();
  const restored = createAuthorizedApplePlaybackStation(hits, '');
  assert.equal(restored.url, hitsPath);
  assert.equal(restored.title, hits.title);
  assert.equal(restored.image, hits.image);
  assert.deepEqual(restored.sources, []);
  playback.activate(restored, createAppleRadioQueue([hits]), {
    autoplay: false, onlyIfIdle: true,
  });
  assert.equal(playback.station?.title, 'Apple Music Hits');
  assert.equal(playback.station?.url, hitsPath);
  assert.equal(playback.playRequest, 0, 'reload never starts audio');
  assert.equal(playback.playing, false);
  assert.equal(playback.globalRadioLease, null, 'signed HLS lease is not restored');
  assert.deepEqual(playback.station?.sources, []);

  const freshUrl = 'https://itsliveradio.apple.com/example/index.m3u8?accessKey=fresh';
  const resolved = createAuthorizedApplePlaybackStation(hits, freshUrl);
  playback.activateGlobalRadio(resolved, 'https://music.apple.com/', Date.now() + 120_000, [
    { id: hits.id, title: hits.title, image: hits.image, url: hitsPath },
  ]);
  assert.equal(playback.station?.sources[0]?.src, freshUrl);
  assert.equal(playback.playRequest, 1, 'only an explicit successful Play resolution requests audio');
  assert.equal(playback.globalRadioLease?.stationId, hits.id);
});

test('late catalog queue hydration never claims a stream or starts music', () => {
  setActivePinia(createPinia());
  const playback = usePlaybackStore();
  const restored = createAuthorizedApplePlaybackStation(hits, '');
  playback.activate(restored, [{ ...hits, url: hitsPath }], { autoplay: false });
  playback.activate(playback.station, createAppleRadioQueue([
    { ...hits, id: 'apple-music-1', title: 'Apple Music 1' }, hits,
  ]), { autoplay: false });
  assert.deepEqual(playback.stations.map(entry => entry.id), ['apple-music-1', hits.id]);
  assert.equal(playback.playRequest, 0);
  assert.equal(playback.station?.url, hitsPath);
  assert.deepEqual(playback.station?.sources, []);
});
