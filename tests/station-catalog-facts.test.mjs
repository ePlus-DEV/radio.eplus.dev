import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stationCatalogFacts } from '../utils/station-catalog-facts.mjs';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('catalog station facts expose only reported category, language and public homepage', () => {
  assert.deepEqual(stationCatalogFacts({
    category: ' Thời sự ', language: ' Tiếng Việt ',
    url: 'https://www.vov.vn/', stream: 'https://stream.test/private.mp3?token=secret',
  }), {
    category: 'Thời sự', language: 'Tiếng Việt',
    homepage: 'https://www.vov.vn/', homepageHost: 'vov.vn', hasFacts: true,
  });
  assert.equal(JSON.stringify(stationCatalogFacts({
    url: 'https://vov.vn/', stream: 'https://s.test/live?password=secret',
  })).includes('secret'), false);
});

test('missing or unverified values stay absent without invented labels or timestamps', () => {
  for (const value of [null, undefined, {}, {category: '   '}, {language: []},
    {url: 'invalid'}, {codec: 'AAC', stream: 'https://s.test/live.mp3'}]) {
    const actual = stationCatalogFacts(value);
    assert.deepEqual(actual, {category:'',language:'',homepage:'',homepageHost:'',hasFacts:false});
    assert.equal('verifiedAt' in actual, false);
  }
  assert.deepEqual(stationCatalogFacts({ category:'Music' }).hasFacts, true);
});

test('reject credentials, executable schemes, local and numeric network addresses', () => {
  for (const url of ['javascript:alert(1)', 'file:///etc/passwd',
    'https://user:password@example.org/', 'http://localhost:8080/',
    'http://router.local/', 'http://127.0.0.1/a',
    'https://[::1]/', 'https://192.168.1.10/', '//example.org/path',
    'not an URL']) {
    const facts = stationCatalogFacts({url});
    assert.equal(facts.homepage, '', url);
    assert.equal(facts.hasFacts, false);
  }
  assert.equal(stationCatalogFacts({url:'http://radio.example.org/listen'}).homepage,
    'http://radio.example.org/listen');
});

test('invalid category and language types do not leak display text', () => {
  const actual = stationCatalogFacts({
    category: '<'.repeat(200), language: 'line\nbreak', url: {href:'https://example.org'},
  });
  assert.equal(actual.hasFacts, false);
  assert.equal(stationCatalogFacts({category:'News',language:'en'}).hasFacts, true);
});

test('station page and details show public facts without altering SEO or raw stream URLs', async () => {
  const [page, component] = await Promise.all([
    read('pages/[area]/[country]/[station].vue'),
    read('components/panel/StationTechnicalInfo.vue'),
  ]);
  assert.match(page, /stationCatalogFacts\(stationMeta\.value\)/);
  assert.match(page, /stationTechnical\.hasDetails \|\| stationFacts\.hasFacts/);
  assert.match(component, /:href="facts\.homepage"/);
  assert.match(component, /rel="noopener noreferrer nofollow"/);
  assert.match(component, /station_technical\.homepage_catalog/);
  assert.doesNotMatch(component, /stream\.src|stream\.url|fetch\(/i);
  assert.match(page, /buildRadioStationSchema/);
  assert.match(page, /useHead\(\(\) => \(\{/);
});

test('all seven languages label the catalog data and avoid verified-status claims', async () => {
  for (const name of ['en-US','vi-VN','fr-FR','ja-JP','ru-RU','zh-CN','zh-TW']) {
    const lang = JSON.parse(await read('lang/' + name + '.json'));
    for (const key of ['category','language','homepage','homepage_catalog'])
      assert.ok(typeof lang.station_technical[key] === 'string' &&
        lang.station_technical[key].trim(), name + ': ' + key);
  }
});
