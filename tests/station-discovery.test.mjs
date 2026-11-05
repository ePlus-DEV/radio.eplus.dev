import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  DISCOVERY_PAGE_SIZE, validDiscoveryStations, filterDiscoveryStations,
  discoveryFacetValues, paginateDiscoveryStations,
} from '../utils/station-discovery.mjs';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

const stations = [
  { url: '/asia/viet-nam/a', station_name: 'Đài Giao Thông', station_country: 'world.asia.viet_nam', country_label: 'Viet Nam', station_category: 'News', station_language: 'vi' },
  { url: '/asia/viet-nam/b', station_name: 'Nhạc Trẻ', station_country: 'world.asia.viet_nam', country_label: 'Viet Nam', station_category: 'Music', station_language: 'vi' },
  { url: '/europe/france/c', station_name: 'La Musique', station_country: 'world.europe.france', country_label: 'France', station_category: 'Music', station_language: 'fr' },
  { url: '/europe/france/d', station_name: 'French News', station_country: 'world.europe.france', country_label: 'France', station_category: 'News', station_language: '' },
  { url: '/asia/viet-nam/e', station_name: 'Radio Jazz', station_country: 'world.asia.viet_nam', country_label: 'Viet Nam', station_category: '', station_language: '' },
];

test('only canonical, named unique station records are eligible', () => {
  const source = [...stations, stations[0], { ...stations[0], url: 'javascript:alert(1)' }, { ...stations[0], station_name: '' }];
  assert.deepEqual(validDiscoveryStations(source).map(x => x.url), stations.map(x => x.url));
  assert.equal(source.length, 8, 'catalog is never mutated');
  assert.deepEqual(validDiscoveryStations(null), []);
});

test('filters intersect country, genre, language and accent-insensitive search', () => {
  const selected = filterDiscoveryStations(stations, {
    query: 'nhac', country: 'world.asia.viet_nam', genre: 'Music', language: 'vi',
  });
  assert.deepEqual(selected.map(x => x.station_name), ['Nhạc Trẻ']);
  assert.deepEqual(filterDiscoveryStations(stations, { query: 'dai giao thong' }).map(x => x.url), ['/asia/viet-nam/a']);
  assert.deepEqual(filterDiscoveryStations(stations, { genre: 'News', language: 'fr' }), []);
  assert.deepEqual(filterDiscoveryStations(stations, { language: 'vi' }).map(x => x.url), ['/asia/viet-nam/a', '/asia/viet-nam/b']);
  assert.deepEqual(filterDiscoveryStations(stations, { query: 'Jazz' }).map(x => x.url), ['/asia/viet-nam/e']);
});

test('facets show only actual values and never manufacture missing categories', () => {
  assert.deepEqual(discoveryFacetValues(stations, 'station_category'), ['Music', 'News']);
  assert.deepEqual(discoveryFacetValues(stations, 'station_language'), ['fr', 'vi']);
  assert.deepEqual(discoveryFacetValues(stations, 'station_country', { genre: 'News', language: 'vi' }), ['world.asia.viet_nam']);
  assert.deepEqual(discoveryFacetValues(stations, 'station_category', { country: 'world.asia.viet_nam', language: 'vi' }), ['Music', 'News']);
  assert.deepEqual(discoveryFacetValues(stations, 'station_language', { country: 'world.europe.france', genre: 'Music' }), ['fr']);
  assert.deepEqual(discoveryFacetValues(stations, 'station_unknown'), []);
});

test('pagination remains bounded for 0, 1, 2, 6, 23 and 200 stations', () => {
  const amounts = [0, 1, 2, 6, 23, 200];
  assert.equal(DISCOVERY_PAGE_SIZE, 6);
  for (const amount of amounts) {
    const input = Array.from({ length: amount }, (_, i) => ({
      url: `/europe/france/station-${i}`, station_name: `Station ${i}`, station_country: 'world.europe.france',
    }));
    const first = paginateDiscoveryStations(input);
    assert.equal(first.total, amount);
    assert.equal(first.items.length, Math.min(6, amount));
    assert.equal(first.pageCount, Math.max(1, Math.ceil(amount / 6)));
    assert.equal(first.from, amount ? 1 : 0);
    const last = paginateDiscoveryStations(input, { page: 999 });
    assert.equal(last.page, last.pageCount);
    assert.equal(last.items.length, amount ? (amount % 6 || 6) : 0);
    assert.equal(last.hasNext, false);
  }
  const huge = Array.from({ length: 200 }, (_, i) => ({ url: `/a/b/c-${i}`, station_name: 'Station ' + i }));
  assert.equal(paginateDiscoveryStations(huge, { limit: 1000 }).items.length, 24);
  assert.equal(paginateDiscoveryStations(huge, { page: -20 }).page, 1);
  assert.equal(paginateDiscoveryStations(huge, { page: 2.5 }).page, 1);
});

test('discovery UI is opt-in, responsive and does not alter homepage SEO or player', async () => {
  const [panel, home, loader, store] = await Promise.all([
    read('components/panel/StationDiscovery.vue'), read('pages/index.vue'),
    read('composables/useStationSearchIndex.ts'), read('stores/playback.ts'),
  ]);
  assert.match(home, /<ClientOnly><PanelStationDiscovery \/><\/ClientOnly>/);
  assert.match(home, /\$t\('home\.title'\)/);
  assert.match(home, /ogDescription: \(\) => seoDescription\.value/);
  assert.match(panel, /const toggleOpen = \(\) =>/);
  assert.match(panel, /if \(open\.value\) void load\(\)/);
  assert.match(panel, /v-model="country"/);
  assert.match(panel, /v-model="genre"/);
  assert.match(panel, /v-model="language"/);
  assert.match(panel, /v-model="query"/);
  assert.match(panel, /paginateDiscoveryStations/);
  assert.match(panel, /pageData\.pageCount > 1/);
  assert.match(panel, /grid-cols-1 gap-3 sm:grid-cols-2/);
  assert.match(panel, /:to="station\.url"/);
  assert.doesNotMatch(panel, /playback\.activate|onMounted\(/, 'discovery browsing should never autoplay or preload');
  assert.match(loader, /Never fetch a multi-station catalog simply because the global header mounts/);
  assert.match(store, /onlyIfIdle/);
});

test('all seven locale labels are present and translated counters have tokens', async () => {
  for (const locale of ['en-US', 'vi-VN', 'fr-FR', 'ja-JP', 'ru-RU', 'zh-CN', 'zh-TW']) {
    const d = JSON.parse(await read('lang/' + locale + '.json'));
    for (const k of [
      'title','description','browse','hide','loading','unavailable','retry','search','search_placeholder',
      'country','all_countries','genre','all_genres','language','all_languages','results','reset',
      'empty','pagination','previous','page','next','metadata_note',
    ]) assert.ok(typeof d.discovery[k] === 'string' && d.discovery[k].trim(), locale + ': ' + k);
    for (const token of ['from','to','total']) assert.ok(d.discovery.results.includes('{'+token+'}'), locale+' missing '+token);
  }
});
