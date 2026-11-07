import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('the player is app-scoped: navigation from Global Radio to Statistics does not unmount audio', async () => {
  const [app, statistics, session] = await Promise.all([
    read('app.vue'),
    read('pages/statistics.vue'),
    read('components/player/Session.vue'),
  ]);
  assert.match(app, /<NuxtPage \/>[\s\S]*<PlayerSession \/>/,
    'PlayerSession must remain outside NuxtPage and route-controlled skeletons');
  assert.doesNotMatch(statistics, /<Player(?:Session)?\b|useAuthorizedGlobalRadioPlayback|activateGlobalRadio|<audio\b/,
    'Statistics must never create, start or replace a station');
  assert.match(session, /:stream-name="station\?\.title \|\| playback\.pendingGlobalRadio\?\.title/,
    'connecting station metadata is visible across routes');
});

test('opening Global Radio never fetches or auto-plays a station before the user selects one', async () => {
  const [page, composable] = await Promise.all([
    read('pages/global-radio/apple-music/index.vue'),
    read('composables/useAuthorizedGlobalRadioPlayback.ts'),
  ]);
  assert.doesNotMatch(page, /prepareOnEplus|onMounted\(\(\) => [\s\S]*playOnEplus\(/);
  assert.match(page, /@select-station="playSelectedStation"/);
  assert.match(page, /if \(station\) void playOnEplus\(station\)/);
  assert.match(composable, /async function play\(station: GlobalRadioStation\)/);
  assert.match(composable, /if \(!import\.meta\.client \|\| !enabled\.value\) return/);
});

test('in-flight explicit Global Play survives route unmount, but a newer station request wins', async () => {
  const [composable, store, restore, player] = await Promise.all([
    read('composables/useAuthorizedGlobalRadioPlayback.ts'),
    read('stores/playback.ts'),
    read('composables/useRestoreLastStation.ts'),
    read('components/player/Player.vue'),
  ]);
  assert.match(composable, /^let activeController: AbortController \| null = null;/m);
  assert.doesNotMatch(composable, /\bonBeforeUnmount\s*\(/,
    'route unmount must not cancel explicit playback');
  assert.match(composable, /activeController\?\.abort\(\)/,
    'a newer Global station selection aborts the former lookup');
  assert.match(composable, /const queueMetadata = createAppleRadioQueue\(getStations\(\)\)/);
  assert.match(composable, /controller\.signal\.aborted \|\| activeController !== controller \|\| !result\.ok/);
  assert.match(composable, /\(playback\.station\?\.url \|\| ''\) !== previousStationUrl/);
  assert.match(composable, /playback\.requestedStationUrl !== previousRequestedUrl/);
  assert.match(store, /globalRadioPendingId: ''/);
  assert.match(store, /options\.onlyIfIdle && \(this\.station \|\| this\.globalRadioPendingId\)/,
    'passive Country defaults should never interrupt a selected Global station');
  assert.match(restore, /playback\.globalRadioPendingId/,
    'idle restore must not race against the listener selection');
  assert.match(player, /const resolvingGlobalSelection = computed\(/,
    'global player dock displays connecting state until an HLS source is available');
});
