import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('online clock sleeps when disabled, hidden or idle and only previews per second on stats', async () => {
  const [presence, app] = await Promise.all([
    read('composables/useOnlinePresence.ts'), read('app.vue'),
  ]);
  assert.match(app, /useOnlinePresence\(\)/);
  assert.match(presence, /document\.visibilityState === 'visible'/);
  assert.match(presence, /document\.hasFocus\(\)/);
  assert.match(presence, /ONLINE_IDLE_MS/);
  assert.match(presence, /statsVisible\(\) \? 1_000 : 5_000/);
  assert.match(presence, /if \(timer !== null \|\| !engaged\(\)\) return/);
  assert.match(presence, /timer = window\.setTimeout\(tick/);
  assert.match(presence, /if \(!statsVisible\(\) \|\| ticks % 5 === 0\) tracker\.flush\(\)/);
  assert.match(presence, /const onPageHide = \(\) =>/);
  assert.match(presence, /radio:online-duration-reset/);
  assert.match(presence, /lastEngagementAt >= ONLINE_IDLE_MS\) tracker\.discard\(\)/);
  assert.doesNotMatch(presence, /setInterval\(/, 'no unconditional global 1s online timer');
});

test('listening clock runs only while media plays, but stays active for background audio', async () => {
  const player = await read('components/player/Player.vue');
  assert.match(player, /const syncDurationClock = \(\): void =>/);
  assert.match(player, /const station = listeningDurationTracker\.activeUrl/);
  assert.match(player, /if \(!listeningDuration\.enabled \|\| !station\)/);
  assert.match(player, /currentRoute\.path === '\/library' && currentRoute\.hash === '#stats'/);
  assert.match(player, /const nextPeriod = statsVisible \? 1_000 : 5_000/);
  assert.match(player, /nextPeriod === 5_000 \|\| durationTickCount % 5 === 0/);
  assert.match(player, /syncDurationClock\(\);\s*\}\s*clearReconnectTimer\(\)/);
  assert.match(player, /watch\(\(\) => \[currentRoute\.path, currentRoute\.hash\], syncDurationClock\)/);
  assert.match(player, /const stopListeningDuration = \(\) => \{\s*stopDurationClock\(\);\s*listeningDurationTracker\.stop\(\)/);
  assert.doesNotMatch(player, /durationInterval = setInterval\(\(\) => \{\s*durationTickCount \+= 1;\s*if \(durationTickCount % 5 === 0\)/);
  // Hidden-tab playback must remain counted, so never gate this timer on visibilityState.
  const activeClock = player.slice(player.indexOf('const syncDurationClock ='), player.indexOf('const stopListeningDuration ='));
  assert.doesNotMatch(activeClock, /document\.hidden|visibilityState/);
});

test('chart geometry is cached during pointer motion and tooltip state updates only when day changes', async () => {
  const chart = await read('components/panel/ListeningStats.vue');
  assert.match(chart, /@pointerenter="cacheChartBounds"/);
  assert.match(chart, /@pointerleave="clearChartHover"/);
  assert.match(chart, /let chartBounds: DOMRect \| null = null/);
  assert.match(chart, /if \(!chartBounds\) cacheChartBounds\(event\)/);
  assert.match(chart, /if \(nextIndex !== hoveredDayIndex\.value\) hoveredDayIndex\.value = nextIndex/);
  assert.match(chart, /cacheChartBounds\(event\);\s*const index = indexFromPointer\(event\)/);
  assert.match(chart, /@pointerdown="onChartPointerDown"/);
  assert.match(chart, /@keydown\.left\.prevent="moveSelectedDay\(-1\)"/);
  assert.match(chart, /@keydown\.right\.prevent="moveSelectedDay\(1\)"/);
});
