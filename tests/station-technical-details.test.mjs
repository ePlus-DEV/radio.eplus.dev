import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stationTechnicalDetails } from '../utils/station-technical-details.mjs';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('prefer stream extension over misleading catalog MIME (AAC marked audio/mpeg)', () => {
  const result = stationTechnicalDetails({
    stream: 'https://example.net/live.aac?token=do-not-expose',
    type: 'audio/mpeg',
  });
  assert.deepEqual(result, { format: 'AAC', formatEvidence: 'url', codec: '', bitrateKbps: null, hasDetails: true });
  assert.equal(JSON.stringify(result).includes('do-not-expose'), false);
});

test('HLS is a transport format, not evidence of an AAC or MP3 codec', () => {
  assert.deepEqual(stationTechnicalDetails({
    stream: 'https://host.test/live.m3u8?expires=123',
  }), { format: 'HLS', formatEvidence: 'url', codec: '', bitrateKbps: null, hasDetails: true });
  assert.equal(stationTechnicalDetails({ stream: 'https://host.test/live', type: 'application/vnd.apple.mpegurl' }).format, 'HLS');
  assert.equal(stationTechnicalDetails({ stream: 'https://host.test/live', type: 'audio/mpeg; charset=utf-8' }).formatEvidence, 'catalog');
});

test('only explicit and plausible reported codec/bitrate values may appear', () => {
  assert.deepEqual(stationTechnicalDetails({
    stream: 'https://example.com/untyped', codec: 'HE-AAC', bitrate: 128,
  }), { format: '', formatEvidence: '', codec: 'HE-AAC', bitrateKbps: 128, hasDetails: true });
  for (const bitrate of [0, -4, 7, 1025, 128.5, NaN, Infinity, '128', null]) {
    assert.equal(stationTechnicalDetails({ bitrate }).bitrateKbps, null, String(bitrate));
  }
  assert.equal(stationTechnicalDetails({ codec: 'untrusted-script' }).codec, '');
  assert.equal(stationTechnicalDetails({ stream: 'javascript:alert(1)' }).hasDetails, false);
});

test('missing catalog fields remain absent and do not fabricate verification timestamps', () => {
  for (const meta of [null, undefined, {}, { stream: 'https://host.example/stream' }, { type: 'application/octet-stream' }]) {
    const actual = stationTechnicalDetails(meta);
    assert.equal(actual.hasDetails, false);
    assert.equal(actual.format, '');
    assert.equal(actual.bitrateKbps, null);
    assert.equal(Object.hasOwn(actual, 'verifiedAt'), false);
  }
});

test('station detail disclosure is optional, translated and does not touch SEO/player code', async () => {
  const [page, component] = await Promise.all([
    read('pages/[area]/[country]/[station].vue'),
    read('components/panel/StationTechnicalInfo.vue'),
  ]);
  assert.match(page, /PanelStationTechnicalInfo v-if="stationTechnical\.hasDetails \|\| stationFacts\.hasFacts"/);
  assert.match(page, /const stationTechnical = computed\(\(\) => stationTechnicalDetails\(stationMeta\.value\)\)/);
  assert.match(page, /buildRadioStationSchema/);
  assert.match(page, /useHead\(\(\) => \(\{/);
  assert.match(page, /const playStation = \(\): void =>/);
  assert.match(component, /<details\b/);
  assert.match(component, /station_technical\.disclaimer/);
  assert.doesNotMatch(component, /stream\.src|stream\.url|fetch\(/i, 'must not expose raw stream URL or fetch it from UI');
});

test('seven locale dictionaries contain provenance and unknown descriptions', async () => {
  for (const locale of ['en-US', 'vi-VN', 'fr-FR', 'ja-JP', 'ru-RU', 'zh-CN', 'zh-TW']) {
    const lang = JSON.parse(await read('lang/' + locale + '.json'));
    for (const key of [
      'title','catalog_badge','format','codec','bitrate','unknown',
      'inferred_url','catalog_reported','kbps','disclaimer',
    ]) assert.ok(typeof lang.station_technical?.[key] === 'string' && lang.station_technical[key].trim(), locale + ': ' + key);
    assert.match(lang.station_technical.kbps, /\{count\}/);
    assert.ok(lang.player?.play && lang.home?.title, locale + ': old translations retained');
  }
});
