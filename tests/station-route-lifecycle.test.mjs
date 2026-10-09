import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('station page owns the static catalog and the application owns playback lifetime', async () => {
  const page = await readFile('pages/[area]/[country]/[station].vue', 'utf8');
  const panel = await readFile('components/panel/Station.vue', 'utf8');
  const app = await readFile('app.vue', 'utf8');
  assert.match(page, /const stationCatalogKey = computed/);
  assert.match(page, /stationCatalogPayload\.value\?\.key === stationCatalogKey\.value/);
  assert.match(page, /lg:grid-cols-\[minmax\(0,14rem\)_minmax\(0,1fr\)\]/);
  assert.match(page, /sourceCount/);
  assert.match(page, /playback\.queueOpen = true/);
  assert.doesNotMatch(page, /<Player\s|@update-data=|pollSchedule|onBeforeUnmount/);
  assert.doesNotMatch(panel, /\$fetch<|emit\("update-data"/);
  assert.match(app, /<PlayerSession\s*\/>/);
});
test('Zing metadata belongs to the selected provider and is reset on station changes', async () => {
  const realtime = await readFile('composables/useStationRealtime.ts', 'utf8');
  assert.match(realtime, /if \(isZingScheduleUrl\(url\)\)/);
  assert.match(realtime, /watch\(\(\) => playback\.station\?\.url, activate\)/);
  assert.match(realtime, /lyricsOpen\.value = false/);
  assert.doesNotMatch(realtime, /useRoute|viet-nam/);
});

