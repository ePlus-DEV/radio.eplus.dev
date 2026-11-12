import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { buildStationSearchIndex } from '../scripts/build-station-search-index.mjs';
import { searchLocalStations, normalizeStationQuery, mergeGlobalSearchHits, filterAndSortStations, filterQueueStations } from '../utils/station-search.mjs';

test('local station search ignores accents, matches words, and ranks names', () => {
  const stations = [
    { station_name: 'English News', url: '/a' },
    { station_name: 'Rap Việt Radio - Zing MP3', url: '/b', featured: true, country_label: 'Viet Nam' },
    { station_name: 'Chạm Radio', url: '/c', featured: true },
    { station_name: 'VOV Giao Thông Hồ Chí Minh', url: '/d', country_label: 'Viet Nam', featured_rank: 1 },
    { station_name: 'Heart UK', url: '/e', country_label: 'United Kingdom', featured_rank: 12 },
  ];
  assert.equal(normalizeStationQuery('Chạm Việt'), 'cham viet');
  assert.deepEqual(searchLocalStations(stations, 'rap viet').map(x => x.url), ['/b']);
  assert.deepEqual(searchLocalStations(stations, 'giao thong').map(x => x.url), ['/d']);
  assert.deepEqual(searchLocalStations(stations, '', 3).map(x => x.url), ['/d', '/e', '/b']);
  assert.deepEqual(searchLocalStations(stations, 'zzzzz'), []);
  assert.deepEqual(searchLocalStations(stations, 'rap', 0), []);
});

test('filterAndSortStations matches accents word-wise, sorts stably, never mutates input', () => {
  const stations = [
    { title: 'VOV Giao Thông' },
    { title: 'Đài Tiếng Nói' },
    { title: 'Chạm Radio' },
    { title: 'BBC World Service' },
    { title: 'Đài Hà Nội' },
  ];
  const titles = list => list.map(station => station.title);

  // Accent-insensitive, including the non-decomposable Đ/đ.
  assert.deepEqual(titles(filterAndSortStations(stations, 'giao thong')), ['VOV Giao Thông']);
  assert.deepEqual(titles(filterAndSortStations(stations, 'dai')), ['Đài Tiếng Nói', 'Đài Hà Nội']);
  // Every query word must appear in the title.
  assert.deepEqual(titles(filterAndSortStations(stations, 'dai ha noi')), ['Đài Hà Nội']);
  assert.deepEqual(filterAndSortStations(stations, 'khong co'), []);

  // Default order is the input order; an empty query keeps the full list.
  assert.deepEqual(titles(filterAndSortStations(stations, '')), titles(stations));
  assert.deepEqual(titles(filterAndSortStations(stations, '   ', 'default')), titles(stations));

  // Sorting compares normalized titles.
  assert.deepEqual(titles(filterAndSortStations(stations, '', 'az')),
    ['BBC World Service', 'Chạm Radio', 'Đài Hà Nội', 'Đài Tiếng Nói', 'VOV Giao Thông']);
  assert.deepEqual(titles(filterAndSortStations(stations, '', 'za')),
    ['VOV Giao Thông', 'Đài Tiếng Nói', 'Đài Hà Nội', 'Chạm Radio', 'BBC World Service']);
  // Filter and sort compose.
  assert.deepEqual(titles(filterAndSortStations(stations, 'dai', 'az')), ['Đài Hà Nội', 'Đài Tiếng Nói']);

  // Ties keep the input order in both directions.
  const ties = [
    { title: 'Heart UK', id: 1 },
    { title: 'heart uk', id: 2 },
    { title: 'Alpha', id: 3 },
  ];
  assert.deepEqual(filterAndSortStations(ties, '', 'az').map(station => station.id), [3, 1, 2]);
  assert.deepEqual(filterAndSortStations(ties, '', 'za').map(station => station.id), [1, 2, 3]);

  // Input array is neither mutated nor returned by reference.
  const snapshot = [...stations];
  const result = filterAndSortStations(stations, '', 'za');
  assert.notEqual(result, stations);
  assert.deepEqual(stations, snapshot);
  assert.deepEqual(filterAndSortStations(null, 'x'), []);
  assert.deepEqual(filterAndSortStations(undefined, ''), []);
});


test('queue search matches non-adjacent query words and respects favorites', () => {
  const stations = [
    { url: '/vov', title: 'VOV Giao Thông Hồ Chí Minh' },
    { url: '/other', title: 'Minh Giao Radio' },
    { url: '/news', title: 'BBC World Service' },
  ];
  assert.deepEqual(filterQueueStations(stations, 'giao minh', [], false).map(x => x.url), ['/vov', '/other']);
  assert.deepEqual(filterQueueStations(stations, 'GIAO   MINH', ['/vov'], true).map(x => x.url), ['/vov']);
  assert.deepEqual(filterQueueStations(stations, 'giao minh', ['/news'], true), []);
  assert.deepEqual(filterQueueStations(stations, '   ', [], false), stations);
  assert.deepEqual(filterQueueStations(stations, 'not found', [], false), []);
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
    const built = await buildStationSearchIndex({ radioRoot: join(root, 'radio'), providerRoot: join(root, 'providers'), outputFile: target });
    assert.equal(built.length, 1);
    assert.equal(built[0].station_country, 'world.asia.viet_nam');
    assert.equal(built[0].station_image, '/img/rap.png');
    assert.equal(built[0].url, '/asia/viet-nam/rap-viet-radio-zing-mp3');
    assert.equal(built[0].featured, true);
    assert.equal(built[0].featured_rank, 2);
    assert.equal(JSON.parse(await readFile(target, 'utf8')).length, 1);
    assert.doesNotMatch(await readFile(target, 'utf8'), /https:\/\/example\.com\/live/, 'search index must not expose stream URLs');
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('seven Global Radio stations appear in the shared header index without exposing streams', async () => {
  const root = await mkdtemp(join(tmpdir(), 'global-search-'));
  try {
    const radioDir = join(root, 'radio', 'asia');
    await mkdir(radioDir, { recursive: true });
    await writeFile(join(radioDir, 'viet-nam.json'), JSON.stringify({
      local: { title: 'Example Local', stream: 'https://example.org/live.mp3' },
    }));
    const providerRoot = fileURLToPath(new URL('../public/catalog/providers/', import.meta.url));
    const file = join(root, 'search.json');
    const result = await buildStationSearchIndex({ radioRoot: join(root, 'radio'), providerRoot, outputFile: file });
    const global = result.filter(x => x.url.startsWith('/global-radio/'));
    assert.equal(global.length, 7);
    assert.equal(new Set(global.map(x => x.url)).size, 7);
    assert.ok(global.every(x => x.station_country === 'global_radio.title'));
    assert.ok(global.every(x => x.station_image.startsWith('/img/global-radio/')));
    assert.ok(global.every(x => !Object.hasOwn(x, 'station_image_fallback')));
    assert.equal(searchLocalStations(result, 'global radio', 20).filter(x => x.url.startsWith('/global-radio/')).length, 7);
    assert.equal(searchLocalStations(result, 'apple music', 20).filter(x => x.url.startsWith('/global-radio/')).length, 7);
    assert.equal(searchLocalStations(result, 'musica uno').some(x => x.url.endsWith('/apple-musica-uno')), true);
    assert.equal(searchLocalStations(result, 'holiday hits').some(x => x.url.endsWith('/apple-music-holiday-hits')), true);
    assert.equal(result.some(x => x.url === '/asia/viet-nam/local'), true);
    assert.doesNotMatch(await readFile(file, 'utf8'), /accessKey|m3u8|listen_url|tunein_url|streams|live.mp3/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('Algolia results retain Global Radio matches and deduplicate by URL', () => {
  const global = [{ url: '/global-radio/apple-music/apple-music-1', station_name: 'Apple Music 1' }];
  const remote = [
    { url: '/asia/viet-nam/vov', station_name: 'VOV' },
    { url: global[0].url, station_name: 'Duplicate' },
    { url: '//invalid.example', station_name: 'Unsafe' },
  ];
  assert.deepEqual(mergeGlobalSearchHits(global, remote).map(item => item.station_name), ['Apple Music 1', 'VOV']);
  assert.deepEqual(mergeGlobalSearchHits(global, remote, 1).map(item => item.url), [global[0].url]);
});

test('empty or unusable Algolia results preserve local Country matches', () => {
  const local = [
    { url: '/global-radio/apple-music/apple-music-1', station_name: 'Apple Music 1' },
    { url: '/asia/viet-nam/vov1', station_name: 'VOV1' },
    { url: '/europe/united-kingdom/heart-uk', station_name: 'Heart UK' },
  ];
  const urls = items => items.map(item => item.url);
  assert.deepEqual(urls(mergeGlobalSearchHits(local, [])), urls(local),
    'a completed zero-hit Algolia query must not erase geographic matches');
  assert.deepEqual(urls(mergeGlobalSearchHits(local, null)), urls(local));
  assert.deepEqual(urls(mergeGlobalSearchHits(local, [null, { url: '//invalid.example' }])), urls(local),
    'malformed remote entries must not suppress valid static results');
  assert.deepEqual(urls(mergeGlobalSearchHits(local, [], 2)), urls(local).slice(0, 2));
  assert.deepEqual(mergeGlobalSearchHits(local, [], 0), []);

  // Nonempty valid Algolia results keep remote order and canonical URL mapping.
  const hits = [
    { url: '/europe/united-kingdom/heart-uk', station_name: 'Heart UK' },
    { url: '/asia/viet-nam/vov1', station_name: 'VOV1' },
  ];
  assert.deepEqual(urls(mergeGlobalSearchHits(local, hits)),
    ['/global-radio/apple-music/apple-music-1', '/europe/united-kingdom/heart-uk', '/asia/viet-nam/vov1']);
});


test('partial Algolia results retain unmatched local stations after remote ranking', () => {
  const local = [
    { url: '/asia/viet-nam/vov1', station_name: 'VOV1' },
    { url: '/asia/viet-nam/vov2', station_name: 'VOV2' },
  ];
  const remote = [{ url: '/asia/viet-nam/vov2', station_name: 'VOV2' }];
  assert.deepEqual(mergeGlobalSearchHits(local, remote).map(hit => hit.url),
    ['/asia/viet-nam/vov2', '/asia/viet-nam/vov1']);
  assert.deepEqual(mergeGlobalSearchHits(local, remote, 1).map(hit => hit.url),
    ['/asia/viet-nam/vov2']);
});

test('UI has featured carousel, compact country cards, and fallback search', async () => {
  const [home, featured, countries, queue, box, result, packageSource] = await Promise.all([
    readFile('pages/index.vue', 'utf8'),
    readFile('components/panel/FeaturedStations.vue', 'utf8'),
    readFile('components/panel/Radio.vue', 'utf8'),
    readFile('components/player/Queue.vue', 'utf8'),
    readFile('components/search/Box.vue', 'utf8'),
    readFile('components/search/Result.vue', 'utf8'),
    readFile('package.json', 'utf8'),
  ]);
  assert.match(home, /<PanelFeaturedStations\s/);
  assert.match(featured, /snap-x snap-mandatory/);
  assert.match(featured, /sm:grid/);
  assert.match(countries, /aspect-\[7\/4\]/);
  assert.match(queue, /filterQueueStations/);
  assert.match(box, /searchLocalStations/);
  assert.match(box, /defineExpose\(\{ focus \}\)/);
  assert.match(await readFile('composables/useStationSearchIndex.ts', 'utf8'), /\/search\/stations\.json/);
  assert.doesNotMatch(result, /Xone FM 96MHz/, 'search must not render mock results');
  const pkg = JSON.parse(packageSource);
  for (const script of ['pregenerate','prebuild','predev']) assert.match(pkg.scripts[script], /build-station-search-index/);
});


test('inline header search keeps loading/error text inside the popover', async () => {
  const [box, header] = await Promise.all([
    readFile('components/search/Box.vue', 'utf8'),
    readFile('components/AppHeader.vue', 'utf8'),
  ]);
  assert.match(header, /<SearchBox[^>]*\sinline\s/);
  assert.match(box, /v-if="!inline && usingLocal && localLoading"/);
  assert.match(box, /v-else-if="!inline && usingLocal && localError"/);
  assert.match(box, /v-show="!inline \|\| resultsOpen"/);
  assert.match(box, /v-if="inline && usingLocal && localLoading"/);
  assert.match(box, /v-else-if="inline && usingLocal && localError"/);
  const inputPosition = box.indexOf('<UInput');
  const resultsPosition = box.indexOf('v-show="!inline || resultsOpen"');
  const inlineStatusPosition = box.indexOf('v-if="inline && usingLocal && localLoading"');
  assert.ok(inputPosition >= 0 && resultsPosition > inputPosition);
  assert.ok(inlineStatusPosition > resultsPosition, 'inline loading must appear only within the hidden results panel');
});

test('United Kingdom catalog removes newer duplicate station routes but keeps original identities', async () => {
  const catalog = JSON.parse(await readFile('public/radio/europe/united-kingdom.json', 'utf8'));
  const world = JSON.parse(await readFile('public/radio/world.json', 'utf8'));
  const pairs = [
    ['heart-uk', 'heart-uk-instant-audio'],
    ['heart-80s', 'heart-80s-962e9a46'],
    ['classic-fm', 'classic-fm-instant-audio'],
    ['bbc-1', 'bbc-radio-1'],
    ['smooth', 'smooth-radio'],
    ['radio-x', 'radio-x-instant-audio'],
    ['caroline', 'radio-caroline'],
    ['classic-fm-uk', 'classic-fm-uk-1ee17d63'],
    ['bbc-world-service-a347209e', 'bbc-world-service-14b6c684'],
    ['bbc-world-service-a347209e', 'bbc-world-service-3e1ea4e1'],
  ];
  for (const [original, later] of pairs) {
    assert.ok(catalog[original], 'original station must survive: ' + original);
    assert.equal(catalog[later], undefined, 'later duplicate must be absent: ' + later);
  }
  assert.equal(catalog['heart-uk'].stream, 'https://media-ssl.musicradio.com/HeartUK');
  assert.ok(catalog['heart-70s'], 'distinct Heart channels must remain');
  assert.ok(catalog['heart-dance'], 'distinct Heart channels must remain');
  assert.equal(Object.keys(catalog).length, 138);
  assert.equal(world.europe['united-kingdom'].station, 138);
  const generated = await readFile('data/world.ts', 'utf8');
  assert.match(generated, /"united-kingdom":\s*\{[^}]*"station": 138/);
});

test('static search index always keeps first station even if later duplicate offers HTTPS', async () => {
  const root = await mkdtemp(join(tmpdir(), 'radio-search-original-'));
  try {
    const radioDir = join(root, 'radio', 'europe');
    const target = join(root, 'search.json');
    await mkdir(radioDir, { recursive: true });
    await writeFile(join(radioDir, 'united-kingdom.json'), JSON.stringify({
      'heart-uk': { title: 'Heart UK', url: 'http://www.heart.co.uk/', stream: 'http://original.example/heart' },
      'heart-uk-instant-audio': { title: 'Heart UK', url: 'https://heart.co.uk', stream: 'https://later.example/heart' },
      'heart-80s': { title: 'Heart 80s', url: 'https://heart.co.uk/80s', stream: 'https://original.example/heart80s' },
      'another-heart': { title: 'Heart UK', url: 'https://other.example/', stream: 'https://other.example/live' },
    }));
    const hits = await buildStationSearchIndex({ radioRoot: join(root, 'radio'), providerRoot: join(root, 'none'), outputFile: target });
    const heart = hits.filter(item => item.station_name === 'Heart UK');
    assert.deepEqual(heart.map(item => item.url), [
      '/europe/united-kingdom/heart-uk',
      '/europe/united-kingdom/another-heart',
    ]);
    assert.equal(hits.some(item => item.station_name === 'Heart 80s'), true);
    assert.equal(hits.length, 3);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('outdated Algolia aliases map to retained original while preserving distinct country stations', () => {
  const canonical = [
    { url: '/europe/united-kingdom/heart-uk', station_name: 'Heart UK' },
    { url: '/europe/united-kingdom/heart-80s', station_name: 'Heart 80s' },
  ];
  const remote = [
    { url: '/europe/united-kingdom/heart-uk-instant-audio', station_name: 'Heart UK' },
    { url: '/europe/united-kingdom/heart-uk', station_name: 'Heart UK' },
    { url: '/europe/united-kingdom/heart-80s-962e9a46', station_name: 'Heart 80s' },
    { url: '/africa/south-africa/heart', station_name: 'Heart UK' },
  ];
  assert.deepEqual(mergeGlobalSearchHits(canonical, remote).map(hit => hit.url), [
    '/europe/united-kingdom/heart-uk',
    '/europe/united-kingdom/heart-80s',
    '/africa/south-africa/heart',
  ]);
});
