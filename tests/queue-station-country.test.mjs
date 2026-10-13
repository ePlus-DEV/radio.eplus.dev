import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stationCountryKey, queueCountryKey } from '../utils/queue-station-country.mjs';

const featured = [
  { id: 'vov-gt-hcm', url: '/asia/viet-nam/vov-gt-hcm' },
  { id: 'heart-uk', url: '/europe/united-kingdom/heart-uk' },
  { id: 'power', url: '/asia/singapore/power' },
];

test('each featured station maps to its own country, never the active Vietnam station', () => {
  assert.equal(stationCountryKey(featured[0].url), 'world.asia.viet_nam');
  assert.equal(stationCountryKey(featured[1].url), 'world.europe.united_kingdom');
  assert.equal(stationCountryKey(featured[2].url), 'world.asia.singapore');
  assert.equal(queueCountryKey(featured), '', 'mixed-country queue must not show Vietnam badge');
});

test('queue-wide label appears only when every station has the same valid country', () => {
  assert.equal(queueCountryKey([featured[0]]), 'world.asia.viet_nam');
  assert.equal(queueCountryKey([featured[1], featured[1]]), 'world.europe.united_kingdom');
  assert.equal(queueCountryKey([]), '');
  assert.equal(queueCountryKey([featured[0], { id: 'missing-url' }]), '');
  assert.equal(stationCountryKey('https://example.com/asia/viet-nam/vov-gt-hcm'), '');
  assert.equal(stationCountryKey('/asia/viet-nam'), '');
});

test('queue template resolves every station country from its own URL', async () => {
  const [queue, en, vi] = await Promise.all([
    readFile('components/player/Queue.vue', 'utf8'),
    readFile('lang/en-US.json', 'utf8'),
    readFile('lang/vi-VN.json', 'utf8'),
  ]);
  assert.match(queue, /stationCountryLabel\(station\)/);
  assert.match(queue, /queueCountryKey\(props\.stations\)/);
  assert.match(queue, /v-if="queueCountryLabel"/);
  assert.doesNotMatch(queue, /\{\{ countryName \|\| stationName \}\}/);
  assert.equal(JSON.parse(en).world.europe.united_kingdom, 'United Kingdom');
  assert.equal(JSON.parse(en).world.asia.singapore, 'Singapore');
  assert.equal(JSON.parse(vi).world.asia.viet_nam, 'Việt Nam');
});
