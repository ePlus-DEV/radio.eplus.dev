import test from 'node:test';
import assert from 'node:assert/strict';
import { createPinia, setActivePinia } from 'pinia';
import { readFile } from 'node:fs/promises';
import { PUBLIC_APPLE_TUNEIN_STATIONS } from '../utils/global-radio-public-tunein.mjs';
import { emptyListeningLibrary, parseListeningLibrary, rememberStation } from '../utils/listening-library.mjs';
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

test('reload restores selected Global station on any Apple detail, without overwriting Country details', () => {
  assert.equal(canRestoreSavedStationOnRoute(hitsPath, hitsPath), true);
  assert.equal(canRestoreSavedStationOnRoute(hitsPath, hitsPath + '/'), true);
  assert.equal(canRestoreSavedStationOnRoute(hitsPath, '/'), true);
  assert.equal(canRestoreSavedStationOnRoute(hitsPath, '/global-radio/apple-music'), true);
  // Visiting another Global detail while listening does not select that page's
  // station, so a reload must keep the actual selected station.
  assert.equal(canRestoreSavedStationOnRoute(hitsPath, '/global-radio/apple-music/apple-music-1'), true);
  assert.equal(canRestoreSavedStationOnRoute(hitsPath, '/asia/viet-nam/vov1'), false);
  assert.equal(canRestoreSavedStationOnRoute('/asia/viet-nam/vov1', '/asia/viet-nam/vov1'), false);
  assert.equal(canRestoreSavedStationOnRoute(hitsPath, '/global-radio/apple-music/../foo'), false);
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

test('all seven Global Radio stations have intact catalog IDs, local artwork and safe reload identity', async () => {
  const catalog = JSON.parse(await readFile(new URL('../public/catalog/providers/apple-music.json', import.meta.url)));
  const stations = catalog.stations;
  assert.equal(stations.length, 7);
  assert.deepEqual(new Set(stations.map(s => s.id)), new Set(Object.keys(PUBLIC_APPLE_TUNEIN_STATIONS)));
  const queue = createAppleRadioQueue(stations);
  assert.equal(queue.length, 7);
  for (const station of stations) {
    const current = createAuthorizedApplePlaybackStation(station, '');
    const path = '/global-radio/apple-music/' + station.id;
    assert.equal(current.url, path);
    assert.equal(current.title, station.title);
    assert.equal(current.image, station.image);
    assert.deepEqual(current.sources, []);
    assert.equal(canRestoreSavedStationOnRoute(path, path), true);
    assert.equal(canRestoreSavedStationOnRoute(path, '/global-radio/apple-music/apple-music-hits'), true);
    await readFile(new URL('../public' + station.image, import.meta.url));
    const mapping = PUBLIC_APPLE_TUNEIN_STATIONS[station.id];
    assert.ok(station.listen_url.endsWith('/ra.' + mapping.apple), station.id);
    assert.ok(station.tunein_url.includes('-' + mapping.tunein + '/'), station.id);
    const persisted = parseListeningLibrary(JSON.stringify(
      rememberStation(emptyListeningLibrary(), current, 'play', true),
    ));
    assert.equal(persisted.lastStation.url, path);
    assert.equal(persisted.lastStation.title, station.title);
    assert.equal(persisted.lastStation.image, station.image);
    assert.equal('sources' in persisted.lastStation, false);
    assert.doesNotMatch(JSON.stringify(persisted), /accessKey|itsliveradio\.apple\.com|\.m3u8/);
  }
});

test('catalog hydrates canonical selected Global metadata without touching a started stream', async () => {
  const restore = await readFile(new URL('../composables/useRestoreLastStation.ts', import.meta.url), 'utf8');
  assert.match(restore, /const canonical = provider\.stations\?\.find\(entry => entry\.id === stationId\)/);
  assert.match(restore, /createAuthorizedApplePlaybackStation\(canonical, ''\)/);
  assert.match(restore, /playback\.station = updated/);
  assert.match(restore, /playback\.station\.sources\.length/);
  assert.match(restore, /playback\.playRequest !== request/);
  assert.doesNotMatch(restore, /resolvePublicTuneInStream/,
    'showing a saved station never requests a fresh signed HLS by itself');
});
