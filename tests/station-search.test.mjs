import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildStationSearchIndex } from '../scripts/build-station-search-index.mjs';
import { searchLocalStations, normalizeStationQuery } from '../utils/station-search.mjs';

test('local station search ignores accents, matches words, and ranks names', () => {
  const stations = [
    { station_name: 'English News', url: '/a' },
    { station_name: 'Rap Việt Radio - Zing MP3', url: '/b', featured: true, country_label: 'Viet Nam' },
    { station_name: 'Chạm Radio', url: '/c', featured: true },
    { station_name: 'VOV Giao Thông Hồ Chí Minh', url: '/d', country_label: 'Viet Nam' },
  ];
  assert.equal(normalizeStationQuery('Chạm Việt'), 'cham viet');
  assert.deepEqual(searchLocalStations(stations, 'rap viet').map(x => x.url), ['/b']);
  assert.deepEqual(searchLocalStations(stations, 'giao thong').map(x => x.url), ['/d']);
  assert.deepEqual(searchLocalStations(stations, '', 2).map(x => x.url), ['/b', '/c']);
  assert.deepEqual(searchLocalStations(stations, 'zzzzz'), []);
  assert.deepEqual(searchLocalStations(stations, 'rap', 0), []);
});

test('build-time fallback index includes only playable radio catalog entries', async () => {
  const root = await mkdtemp(join(tmpdir(), 'radio-search-'));
  try {
    const radioDir = join(root, 'radio', 'asia');
    const target = join(root, 'output', 'search', 'stations.json');
    await mkdir(radioDir, { recursive: true });
    await writeFile(join(radioDir, 'viet-nam.json'), JSON.stringify({
      'rap-viet-radio-zing-mp3': { title: 'Rap Việt Radio - Zing MP3', stream: 'https://example.com/live', features: '/img/rap.png' },
      invalid: { title: 'Broken station', stream: '' },
      empty: { stream: 'https://example.com/broken' },
    }));
    const built = await buildStationSearchIndex({ radioRoot: join(root, 'radio'), outputFile: target });
    assert.equal(built.length, 1);
    assert.equal(built[0].station_country, 'world.asia.viet_nam');
    assert.equal(built[0].station_image, '/img/rap.png');
    assert.equal(built[0].url, '/asia/viet-nam/rap-viet-radio-zing-mp3');
    assert.equal(built[0].featured, true);
    assert.equal(JSON.parse(await readFile(target, 'utf8')).length, 1);
    assert.doesNotMatch(await readFile(target, 'utf8'), /https:\/\/example\.com\/live/, 'search index must not expose stream URLs');
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('UI has featured carousel, compact country cards, and fallback search', async () => {
  const [home, featured, countries, box, result, packageSource] = await Promise.all([
    readFile('pages/index.vue', 'utf8'),
    readFile('components/panel/FeaturedStations.vue', 'utf8'),
    readFile('components/panel/Radio.vue', 'utf8'),
    readFile('components/search/Box.vue', 'utf8'),
    readFile('components/search/Result.vue', 'utf8'),
    readFile('package.json', 'utf8'),
  ]);
  assert.match(home, /<PanelFeaturedStations\s/);
  assert.match(featured, /snap-x snap-mandatory/);
  assert.match(featured, /sm:grid/);
  assert.match(countries, /aspect-\[7\/4\]/);
  assert.match(box, /searchLocalStations/);
  assert.match(box, /\/search\/stations\.json/);
  assert.doesNotMatch(result, /Xone FM 96MHz/, 'search must not render mock results');
  const pkg = JSON.parse(packageSource);
  for (const script of ['pregenerate','prebuild','predev']) assert.match(pkg.scripts[script], /build-station-search-index/);
});
