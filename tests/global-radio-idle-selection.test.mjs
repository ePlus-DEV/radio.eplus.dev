import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('opening Global Radio is idle and never resolves or autoplays a station', async () => {
  const directory = await read('pages/global-radio/apple-music/index.vue');
  assert.match(directory, /<PanelStation/);
  assert.match(directory, /@select-station="playSelectedStation"/);
  assert.match(directory, /if \(station\) void playOnEplus\(station\)/);
  assert.doesNotMatch(directory, /prepareOnEplus|onMounted\([^]*playOnEplus|onMounted\([^]*resolvePublicTuneInStream/);
  assert.doesNotMatch(directory, /provider\.value\?\.stations\.(?:forEach|map)\([^]*playOnEplus/,
    'never fetch seven streams on directory entry');
});

test('explicit Global Play is app-scoped and survives route navigation', async () => {
  const composable = await read('composables/useAuthorizedGlobalRadioPlayback.ts');
  const store = await read('stores/playback.ts');
  assert.match(composable, /let activeController: AbortController \| null = null/);
  assert.match(composable, /const pendingStationId = toRef\(playback, 'globalRadioPendingId'\)/);
  assert.match(composable, /const error = toRef\(playback, 'globalRadioError'\)/);
  assert.match(composable, /async function play\(station: GlobalRadioStation\)/);
  assert.match(composable, /activeController\?\.abort\(\)/);
  assert.match(composable, /const queueMetadata = createAppleRadioQueue\(getStations\(\)\)/);
  assert.match(composable, /playback\.activateGlobalRadio\(source, station\.listen_url, result\.expiresAt, queueMetadata\)/);
  assert.doesNotMatch(composable, /onBeforeUnmount\(/, 'changing pages must not abort an explicit Play');
  assert.match(store, /globalRadioPendingId: ''/);
  assert.match(store, /globalRadioError: ''/);
  assert.match(store, /pendingGlobalRadio: null as RadioStationOption \| null/);
});

test('the shared player displays an explicit pending station without faking audio', async () => {
  const [composable, store, session, player] = await Promise.all([
    read('composables/useAuthorizedGlobalRadioPlayback.ts'),
    read('stores/playback.ts'),
    read('components/player/Session.vue'),
    read('components/player/Player.vue'),
  ]);
  assert.match(composable, /playback\.pendingGlobalRadio = \{/);
  assert.match(composable, /image: siteAssetUrl\(station\.image \|\| '\/brand\/onair-mark\.svg'\)/);
  assert.match(store, /this\.pendingGlobalRadio = null/);
  assert.match(session, /playback\.pendingGlobalRadio\?\.image/);
  assert.match(session, /playback\.pendingGlobalRadio\?\.title/);
  assert.match(player, /const resolvingGlobalSelection = computed/);
  assert.match(player, /waiting \|\| resolvingGlobalSelection/);
  assert.match(player, /:disabled="!hasPlayableSource"/, 'player must not claim it can play before receiving a stream');
  assert.doesNotMatch(composable, /localStorage|sessionStorage|accessKey/);
});

test('late idle restoration cannot override the pending explicit Global selection', async () => {
  const restore = await read('composables/useRestoreLastStation.ts');
  assert.match(restore, /!preferences\.restoreStation \|\| playback\.pendingGlobalRadio/);
  assert.equal((restore.match(/if \(playback\.pendingGlobalRadio\) return;/g) || []).length, 1);
  assert.match(restore, /playback\.pendingGlobalRadio \|\| playback\.playing/,
    'late public queue loading cannot replace an explicit newer Global selection');
  assert.doesNotMatch(restore, /resolvePublicTuneInStream/,
    'idle restore must never fetch a signed HLS stream');
});
