import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createAppleRadioQueue } from '../utils/global-radio-station.mjs';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('Global Radio uses the Country Station panel, not a duplicate list implementation', async () => {
  const [global, shared, country] = await Promise.all([
    read('pages/global-radio/apple-music/index.vue'),
    read('components/panel/Station.vue'),
    read('pages/[area]/[country]/index.vue'),
  ]);
  assert.match(global, /<PanelStation[\s\S]*:stations="stationCards"[\s\S]*@select-station="playSelectedStation"/);
  assert.match(country, /<PanelStation[\s\S]*@select-station="playSelected"[\s\S]*:stations="stations"/);
  assert.doesNotMatch(global, /v-for="station in provider\?\.stations|<article\b|<audio\b/,
    'Global must not reimplement cards or create another player');
  assert.match(shared, /grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 lg:grid-cols-4 2xl:grid-cols-5/);
  assert.match(shared, /<CountryMarquee :text="station\.title" \/>/);
  assert.match(shared, /h-11 w-11/);
  assert.match(shared, /@click="emit\('select-station', station\)"/);
  assert.match(shared, /<NuxtLink[\s\S]*:prefetch="false"[\s\S]*:to="station\.url"/);
});

test('Global cards keep all seven real local covers and public detail URLs without signed streams', async () => {
  const provider = JSON.parse(await read('public/catalog/providers/apple-music.json'));
  const global = await read('pages/global-radio/apple-music/index.vue');
  assert.equal(provider.stations.length, 7);
  assert.equal(new Set(provider.stations.map(station => station.id)).size, 7);
  assert.match(global, /image: station\.image \|\| '\/brand\/onair-mark\.svg'/);
  assert.match(global, /url: '\/global-radio\/apple-music\/' \+ station\.id/);
  assert.match(global, /provider\.value\?\.stations\.find\(item => item\.id === selected\.id\)/);
  assert.match(global, /if \(station\) void playOnEplus\(station\)/);
  const options = createAppleRadioQueue(provider.stations);
  assert.deepEqual(options.map(option => option.image), provider.stations.map(station => station.image));
  assert.ok(options.every(option => option.url === '/global-radio/apple-music/' + option.id));
  assert.doesNotMatch(JSON.stringify(options), /accessKey|m3u8|\.mp3/);
});

test('shared Country card defaults remain active; Global loading and unavailable states are opt-in', async () => {
  const [shared, global, composable] = await Promise.all([
    read('components/panel/Station.vue'),
    read('pages/global-radio/apple-music/index.vue'),
    read('composables/useAuthorizedGlobalRadioPlayback.ts'),
  ]);
  assert.match(shared, /eyebrowKey: "panel\.play_from_radio"/);
  assert.match(shared, /pendingStationId: ""/);
  assert.match(shared, /playEnabled: true/);
  assert.match(shared, /disabledReason: ""/);
  assert.match(shared, /station\.id === props\.pendingStationId/);
  assert.match(shared, /:aria-busy="isPending\(station\)"/);
  assert.match(shared, /:disabled="!playEnabled \|\| isPending\(station\)"/);
  assert.match(shared, /isPending\(station\) \? 'i-lucide-loader-circle'/);
  assert.match(global, /:pending-station-id="pendingStationId"/);
  assert.match(global, /:play-enabled="canListenOnEplus"/);
  assert.match(global, /:disabled-reason="t\('global_radio\.resolver_unavailable'\)"/);
  assert.match(composable, /activeController\?\.abort\(\)/);
  assert.match(composable, /pendingStationId\.value = station\.id/);
  assert.match(composable, /resolvePublicTuneInStream\\(\\{[\\s\\S]*station, corsServer: corsServer\\.value, signal: controller\\.signal,/.replaceAll('\\','\\') );
  assert.doesNotMatch(global, /Promise\.all\(/, 'the Global directory never resolves every stream');
});

test('playing/paused state and SEO metadata remain separated from artwork/detail navigation', async () => {
  const [global, shared, detail] = await Promise.all([
    read('pages/global-radio/apple-music/index.vue'),
    read('components/panel/Station.vue'),
    read('pages/global-radio/apple-music/[station].vue'),
  ]);
  assert.match(global, /useStaticPageSeo\(\{ title, description \}\)/);
  assert.match(detail, /useStaticPageSeo\(\{ title, description \}\)/);
  assert.match(shared, /station\.id === props\.activeStationId && \(playback\.playing \|\| playback\.waiting\)/);
  assert.match(shared, /:aria-pressed="isPlaying\(station\)"/);
  assert.match(shared, /:to="station\.url"/);
  assert.doesNotMatch(global, /listen_on_apple|listen_on_tunein|accessKey|\.m3u8/);
});
