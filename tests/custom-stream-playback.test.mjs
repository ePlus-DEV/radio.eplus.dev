import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createCustomPlaybackStation, customStreamIdentity, isCustomStreamStation } from '../utils/custom-radio-streams.mjs';
import { stationIdentity } from '../utils/listening-library.mjs';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
const sample = { title: 'My local radio', url: 'https://stream.example.org/live.mp3' };

test('personal URL only enters one direct audio source, never a public station identity', () => {
  const station = createCustomPlaybackStation(sample);
  assert.ok(station);
  assert.equal(station.area, 'custom');
  assert.equal(station.url, customStreamIdentity(sample.url));
  assert.deepEqual(station.sources, [{ src: sample.url, type: 'audio/mpeg', source: 'primary', proxied: false }]);
  assert.ok(!station.url.includes(sample.url) && !station.url.startsWith('/'));
  assert.equal(stationIdentity(station), null);
  assert.ok(isCustomStreamStation(station));
  assert.equal(isCustomStreamStation({ ...station, area: 'catalog' }), false);
  assert.notEqual(station.url, createCustomPlaybackStation({ ...sample, url: 'https://stream.example.org/other.mp3' }).url);
});
test('validate custom format before player activation; reject playlist indirection and secret URLs', () => {
  assert.equal(createCustomPlaybackStation({ title: 'HLS', url: 'https://radio.example.org/a.m3u8' }).sources[0].type, 'application/vnd.apple.mpegurl');
  assert.equal(createCustomPlaybackStation({ title: 'AAC', url: 'https://radio.example.org/a.aac' }).sources[0].type, 'audio/aac');
  assert.equal(createCustomPlaybackStation({ title: 'Playlist', url: 'https://radio.example.org/a.pls' }), null);
  assert.equal(createCustomPlaybackStation({ title: 'Unsafe', url: 'http://127.0.0.1:8000/live' }), null);
  assert.equal(createCustomPlaybackStation({ title: 'Signed', url: 'https://radio.example.org/a.mp3?token=secret' }), null);
});
test('UI uses only shared PlayerSession and suppresses private sharing, reporting and stats', async () => {
  const [panel, player, now, session] = await Promise.all([
    read('components/panel/CustomRadioStreams.vue'),
    read('components/player/Player.vue'),
    read('components/player/NowPlaying.vue'),
    read('components/player/Session.vue'),
  ]);
  assert.match(panel, /playback\.activate\(station, \[\], \{ autoplay: true \}\)/);
  assert.match(panel, /playback\.pauseRequest \+= 1/);
  assert.match(session, /<Player\b/);
  assert.doesNotMatch(panel, /new Audio\(|createElement\(['"]audio['"]\)|sendBeacon|\bfetch\(/);
  assert.match(player, /isCustomStreamStation\(playback\.station\)/);
  assert.match(player, /customStation\.value \? '' : stationReportUrl/);
  assert.match(player, /customStation\.value \? '' : stationReportEmailUrl/);
  assert.match(player, /:station-path="customStation \? '' : stationUrl"/);
  assert.match(player, /:favorite-enabled="!customStation"/);
  assert.match(now, /v-if="favoriteEnabled"/);
  assert.match(player, /listeningDuration\.enabled && !customStation\.value/);
  assert.match(player, /isCustomStreamStation\(station\) \|\| !runtimeConfig\.public\.ga4Enabled/);
  assert.match(player, /if \(customStation\.value\) return;\s*listeningDurationTracker\.start\(playback\.station\)/);
});
