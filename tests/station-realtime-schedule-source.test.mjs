import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('realtime watches schedule and metadata provider changes without resetting station history', async () => {
  const source = await readFile('composables/useStationRealtime.ts', 'utf8');
  assert.match(source, /watch\(\(\) => \[playback\.station\?\.url, playback\.station\?\.schedule, appleTuneInMetadataMarker\(playback\.station\)\]/);
  assert.match(source, /if \(url !== previous\?\.\[0\]\) \{\s*activate\(\)/);
  assert.match(source, /else if \(clientReady\) \{\s*polling\.start\(appleTuneInMetadataMarker\(playback\.station\) \|\| playback\.station\?\.schedule \|\| ''\)/);
});
