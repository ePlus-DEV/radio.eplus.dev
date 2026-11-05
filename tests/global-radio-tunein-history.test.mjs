import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PUBLIC_APPLE_TUNEIN_STATIONS } from '../utils/global-radio-public-tunein.mjs';
import {
  appleTuneInStationId, appleTuneInHistoryMarker, stationIdFromTuneInHistoryMarker,
  buildPublicTuneInHistoryRequest, parseTuneInHistory, fetchPublicTuneInHistory,
} from '../utils/global-radio-tunein-history.mjs';

test('only seven exact Apple Music station paths can request anonymous history', () => {
  assert.equal(Object.keys(PUBLIC_APPLE_TUNEIN_STATIONS).length, 7);
  for (const [id, station] of Object.entries(PUBLIC_APPLE_TUNEIN_STATIONS)) {
    const entry = { id, url: '/global-radio/apple-music/' + id };
    assert.equal(appleTuneInStationId(entry), id);
    assert.equal(stationIdFromTuneInHistoryMarker(appleTuneInHistoryMarker(entry)), id);
    const url = buildPublicTuneInHistoryRequest(id);
    assert.ok(url.startsWith('https://cors-eplus-bba6d8ad0ca6.herokuapp.com/https://opml.radiotime.com/Browse.ashx?'));
    assert.equal(new URL(url).searchParams.get('c'), 'playlist');
    assert.equal(new URL(url).searchParams.get('id'), station.tunein);
    assert.equal(new URL(url).searchParams.get('render'), 'json');
    for (const forbidden of ['partnerId', 'partnerKey', 'accessKey', 'itemToken', 'paln'])
      assert.equal(new URL(url).searchParams.has(forbidden), false);
  }
  assert.equal(buildPublicTuneInHistoryRequest('../evil'), null);
  assert.equal(appleTuneInHistoryMarker({ id: 'apple-music-1', url: '/asia/vietnam/apple-music-1' }), '');
  assert.equal(stationIdFromTuneInHistoryMarker('tunein-apple-history:../../wrong'), '');
});

test('parses real-song fields, nested history and explicitly marked current track', () => {
  const result = parseTuneInHistory({
    head: { status: '200' },
    body: [{
      key: 'history', children: [
        { element: 'outline', type: 'song', text: 'Earlier Song', subtext: 'Earlier Artist', time: '1793900000' },
        { element: 'outline', current_track: 'An Apple Music show', text: 'Apple Music 1' },
        { element: 'outline', playing: 'Live Artist - Live Song', text: 'Apple Music 1' },
        { element: 'outline', playing: 'Live Artist - Live Song', text: 'Apple Music 1' },
      ],
    }],
  });
  assert.deepEqual(result.nowPlaying, { title: 'Live Song', artist: 'Live Artist' });
  assert.equal(result.playlist.length, 2);
  assert.deepEqual(result.playlist.map(row => row.track_title), ['Live Song', 'Earlier Song']);
  assert.equal(result.playlist[1].track_played, 1793900000);
});

test('history is not proof that a song is playing right now', () => {
  const result = parseTuneInHistory({ body: [
    { title: 'Past Song', artist: 'Past Artist', track_played: 1793900000 },
    { title: 'An announcement', commercial: true, artist: 'Voice' },
    { text: 'The Dotty Show', current_track: 'The Dotty Show' },
    { text: 'Station slogan', subtext: 'Not a song' },
    { title: 'No artist' },
    { type: 'song', text: 'Another Song', subtext: 'Another Artist' },
  ] });
  assert.equal(result.nowPlaying, null);
  assert.deepEqual(result.playlist.map(item => item.track_title), ['Past Song', 'Another Song']);
  assert.ok(result.playlist.every(item => item.track_image === ''));
});

test('malformed responses, provider faults and oversized history fail closed', () => {
  assert.throws(() => parseTuneInHistory({ head: { status: 403 }, body: [] }), /unavailable/);
  assert.deepEqual(parseTuneInHistory(null), { playlist: [], nowPlaying: null });
  assert.deepEqual(parseTuneInHistory({ body: [{ text: 'Apple Music Hits' }] }), { playlist: [], nowPlaying: null });
  const many = Array.from({ length: 200 }, (_, i) => ({ title: 'Track ' + i, artist: 'Artist' }));
  assert.ok(parseTuneInHistory({ body: many }).playlist.length <= 30);
});

test('read-only provider request uses no credentials and supports cancellation', async () => {
  const stationId = 'apple-music-1';
  const controller = new AbortController();
  let capturedSignal;
  const result = await fetchPublicTuneInHistory({
    stationId, signal: controller.signal,
    fetcher: async (url, opts) => {
      assert.equal(opts.method, 'GET');
      assert.equal(opts.cache, 'no-store');
      assert.equal(opts.credentials, 'omit');
      assert.ok(url.includes('/Browse.ashx?'));
      capturedSignal = opts.signal;
      return { ok: true, json: async () => ({ head: { status: 200 }, body: [] }) };
    },
  });
  assert.deepEqual(result, { playlist: [], nowPlaying: null });
  assert.equal(capturedSignal.aborted, false);
  await assert.rejects(fetchPublicTuneInHistory({ stationId: 'invalid', fetcher: async () => {
    assert.fail('must not request an unknown station');
  } }), /invalid_station/);

  const pending = new AbortController();
  const promise = fetchPublicTuneInHistory({
    stationId, signal: pending.signal,
    fetcher: async (_url, opts) => new Promise((_resolve, reject) => {
      opts.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    }),
  });
  pending.abort();
  await assert.rejects(promise, /aborted/);
});

test('one station polling flow feeds shared mobile/desktop queue without touching audio', async () => {
  const realtime = await readFile(new URL('../composables/useStationRealtime.ts', import.meta.url), 'utf8');
  const queue = await readFile(new URL('../components/player/Queue.vue', import.meta.url), 'utf8');
  const session = await readFile(new URL('../components/player/Session.vue', import.meta.url), 'utf8');
  assert.match(realtime, /fetchPublicTuneInHistory/);
  assert.match(realtime, /polling\.start\(appleTuneInHistoryMarker/);
  assert.match(realtime, /value\.isTuneInHistory \? \(value\.nowPlaying \|\| null\)/);
  assert.match(queue, /hasTuneInHistory/);
  assert.match(queue, /isLivePlaylistTrack\(item, index\)/);
  assert.match(queue, /panel\.tunein_history_unavailable/);
  assert.match(session, /:playlist="playlist"/);
  assert.doesNotMatch(realtime, /Playing\.ashx|accessKey|\.play\(/);
});
