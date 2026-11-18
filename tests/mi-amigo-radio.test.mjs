import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createPlaybackStation } from '../utils/playback-station.mjs';
import { buildPlaybackSources } from '../utils/radio-source-plan.mjs';

const catalog = JSON.parse(
  readFileSync(new URL('../public/radio/europe/italy.json', import.meta.url), 'utf8'),
);

test('Mi Amigo Radio offers its direct AAC stream then the configured CORS fallback', () => {
  const entry = catalog['mi-amigo-radio'];
  assert.ok(entry, 'Mi Amigo Radio must be listed in Italy');
  assert.equal(entry.title, 'Mi Amigo Radio');
  assert.equal(entry.url, 'https://www.miamigoradio.it/');
  assert.equal(entry.type, 'audio/aac');
  assert.equal(entry.stream, 'https://nr12.newradio.it:8662/Live');
  assert.equal(entry.features, 'https://www.miamigoradio.it/css-img/logoRadioMiAmigo.svg');
  assert.equal(entry.cros, false);

  const corsServer = 'https://cors.example/';
  const station = createPlaybackStation({
    area: 'europe',
    country: 'italy',
    id: 'mi-amigo-radio',
    meta: entry,
    corsServer,
  });

  assert.equal(station.url, '/europe/italy/mi-amigo-radio');
  const candidates = buildPlaybackSources(station.sources, corsServer);
  assert.deepEqual(
    candidates.map(({ src, proxied }) => [src, Boolean(proxied)]),
    [
      ['https://nr12.newradio.it:8662/Live', false],
      ['https://cors.example/https://nr12.newradio.it:8662/Live', true],
    ],
  );
});
