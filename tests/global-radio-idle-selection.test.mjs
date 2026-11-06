import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('Global Radio only prepares the first idle station, and never autoplays on navigation', async () => {
  const [directory, country] = await Promise.all([
    read('pages/global-radio/apple-music/index.vue'),
    read('pages/[area]/[country]/index.vue'),
  ]);
  assert.match(directory, /onMounted\(\(\) => \{/);
  assert.match(directory, /listening\.hydrate\(\)/);
  assert.match(directory, /listening\.library\.lastStation \|\| playback\.station \|\| playback\.requestedStationUrl/);
  assert.match(directory, /const firstStation = provider\.value\?\.stations\[0\]/);
  assert.match(directory, /if \(firstStation\) void prepareOnEplus\(firstStation\)/);
  assert.match(country, /listenDefault\(\)/, 'Country still performs the existing idle selection');
  assert.doesNotMatch(directory, /provider\.value\?\.stations\.(?:map|forEach)\([^)]*playOnEplus/);
});

test('Global pending selection is metadata-only and player dock reports Connecting', async () => {
  const [composable, store, session, player] = await Promise.all([
    read('composables/useAuthorizedGlobalRadioPlayback.ts'),
    read('stores/playback.ts'),
    read('components/player/Session.vue'),
    read('components/player/Player.vue'),
  ]);
  assert.match(store, /pendingGlobalRadio: null as RadioStationOption \| null/);
  assert.match(store, /this\.pendingGlobalRadio = null/);
  assert.match(composable, /function prepare\(station: GlobalRadioStation\)/);
  assert.match(composable, /return select\(station, false, true\)/);
  assert.match(composable, /pendingAutoPlay = autoplay/);
  assert.match(composable, /playback\.pendingGlobalRadio = \{/);
  assert.match(composable, /image: siteAssetUrl\(station\.image \|\| '\/brand\/onair-mark\.svg'\)/);
  assert.match(composable, /if \(controller\.signal\.aborted \|\| !result\.ok \|\| \(onlyIfIdle && playback\.station\)\) return/);
  assert.match(composable, /\{ autoplay: pendingAutoPlay \}/);
  assert.match(session, /playback\.pendingGlobalRadio\?\.image/);
  assert.match(session, /playback\.pendingGlobalRadio\?\.title/);
  assert.match(player, /const resolvingGlobalSelection = computed/);
  assert.match(player, /waiting \|\| resolvingGlobalSelection/);
  assert.match(player, /:disabled="!hasPlayableSource"/, 'never fake a playable stream');
});

test('Single Play upgrades the first silent request; another card aborts its predecessor', async () => {
  const [directory, shared, composable] = await Promise.all([
    read('pages/global-radio/apple-music/index.vue'),
    read('components/panel/Station.vue'),
    read('composables/useAuthorizedGlobalRadioPlayback.ts'),
  ]);
  assert.match(shared, /pendingPlayableStationId: ""/);
  assert.match(shared, /:disabled="!playEnabled \|\| \(isPending\(station\) && !canPlayWhilePending\(station\)\)"/);
  assert.match(directory, /:pending-playable-station-id="pendingPassiveStationId"/);
  assert.match(composable, /if \(autoplay\) \{\s*pendingAutoPlay = true;\s*pendingPassiveStationId\.value = ''/);
  assert.match(composable, /activeController\?\.abort\(\)/);
  assert.match(composable, /pendingStationId\.value = station\.id/);
});
