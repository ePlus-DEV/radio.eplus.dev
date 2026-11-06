import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildStationSearchIndex } from '../scripts/build-station-search-index.mjs';
import { searchLocalStations, mergeGlobalSearchHits } from '../utils/station-search.mjs';
import {
  normalizeStationHomepage, stationCatalogIdentity,
} from '../utils/station-catalog-identity.mjs';
import { mergeStations } from '../scripts/sync-instant-audio.mjs';

test('UK catalog Heart UK and Heart 80s appear once in generated search, without deleting route data', async () => {
  const catalog = JSON.parse(await readFile(new URL('../public/radio/europe/united-kingdom.json', import.meta.url)));
  assert.equal(catalog['heart-uk'].title, catalog['heart-uk-instant-audio'].title);
  assert.equal(catalog['heart-80s'].title, catalog['heart-80s-962e9a46'].title);
  assert.equal(stationCatalogIdentity(catalog['heart-uk']), stationCatalogIdentity(catalog['heart-uk-instant-audio']));
  assert.equal(stationCatalogIdentity(catalog['heart-80s']), stationCatalogIdentity(catalog['heart-80s-962e9a46']));
  const dir = await mkdtemp(join(tmpdir(), 'onair-dedup-'));
  try {
    const countryDir = join(dir, 'radio', 'europe');
    await mkdir(countryDir, { recursive: true });
    await writeFile(join(countryDir, 'united-kingdom.json'), JSON.stringify(catalog));
    const index = await buildStationSearchIndex({
      radioRoot: join(dir, 'radio'),
      providerRoot: join(dir, 'missing-providers'),
      outputFile: join(dir, 'search.json'),
    });
    const find = title => index.filter(item => item.station_name === title);
    assert.deepEqual(find('Heart UK').map(x => x.url), ['/europe/united-kingdom/heart-uk']);
    assert.deepEqual(find('Heart 80s').map(x => x.url), ['/europe/united-kingdom/heart-80s']);
    assert.equal(find('Heart 70s').length, 1);
    assert.equal(find('Heart 90s').length, 1);
    assert.equal(find('Heart Dance').length, 1);
    assert.equal(find('Heart London 106.2 [MP3]').length, 1);
    assert.equal(find('Heart London 106.2 [AAC]').length, 1);
    assert.deepEqual(searchLocalStations(index, 'heart uk').map(x => x.url),
      ['/europe/united-kingdom/heart-uk']);
    const serialized = await readFile(join(dir, 'search.json'), 'utf8');
    assert.doesNotMatch(serialized, /HeartUKMP3|HeartUK"|accessKey|\.m3u8/,
      'index must not leak stream information');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('same name but distinct broadcaster homepage remains a separate station', async () => {
  assert.equal(normalizeStationHomepage('https://www.heart.co.uk/'),
    normalizeStationHomepage('http://heart.co.uk'));
  assert.notEqual(stationCatalogIdentity({ title: 'Heart UK', url: 'https://other.example/' }),
    stationCatalogIdentity({ title: 'Heart UK', url: 'https://www.heart.co.uk' }));
  const dir = await mkdtemp(join(tmpdir(), 'onair-distinct-'));
  try {
    const p = join(dir, 'radio', 'europe');
    await mkdir(p, { recursive: true });
    await writeFile(join(p, 'united-kingdom.json'), JSON.stringify({
      network: { title: 'Mix FM', stream: 'https://example.com/live', url: 'https://one.example/' },
      independent: { title: 'Mix FM', stream: 'https://example.com/other', url: 'https://two.example/' },
    }));
    const index = await buildStationSearchIndex({
      radioRoot: join(dir, 'radio'), providerRoot: join(dir, 'absent'),
      outputFile: join(dir, 'search.json'),
    });
    assert.equal(index.filter(x => x.station_name === 'Mix FM').length, 2);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('stale Algolia Heart UK alias resolves to canonical local result, across result order', () => {
  const canonical = {
    url: '/europe/united-kingdom/heart-uk',
    station_name: 'Heart UK', station_country: 'world.europe.united_kingdom',
  };
  const eighty = {
    url: '/europe/united-kingdom/heart-80s',
    station_name: 'Heart 80s', station_country: canonical.station_country,
  };
  const aliases = [
    { ...canonical, url: '/europe/united-kingdom/heart-uk-instant-audio' },
    canonical,
    { ...canonical, url: '/asia/singapore/heart-uk', station_country: 'world.asia.singapore' },
    { ...eighty, url: '/europe/united-kingdom/heart-80s-962e9a46' },
    eighty,
    { url: '/europe/united-kingdom/heart-dance', station_name: 'Heart Dance' },
  ];
  const urls = mergeGlobalSearchHits([canonical, eighty], aliases).map(x => x.url);
  assert.deepEqual(urls, [
    canonical.url, '/asia/singapore/heart-uk', eighty.url, '/europe/united-kingdom/heart-dance',
  ]);
  assert.deepEqual(mergeGlobalSearchHits([canonical, eighty], aliases.slice().reverse()).map(x => x.url), [
    '/europe/united-kingdom/heart-dance', eighty.url, '/asia/singapore/heart-uk', canonical.url,
  ]);
});

test('ambiguous same-name radios must not be silently merged by Algolia URL', () => {
  const local = [
    { url: '/europe/united-kingdom/mix-fm-a', station_name: 'Mix FM' },
    { url: '/europe/united-kingdom/mix-fm-b', station_name: 'Mix FM' },
  ];
  const remote = [
    { url: local[1].url, station_name: 'Mix FM' },
    { url: local[0].url, station_name: 'Mix FM' },
  ];
  assert.deepEqual(mergeGlobalSearchHits(local, remote).map(x => x.url), remote.map(x => x.url));
});

test('future sync enriches curated Heart station with other stream instead of adding a new alias', () => {
  const existing = {
    'heart-uk': {
      title: 'Heart UK', url: 'https://www.heart.co.uk',
      stream: 'https://media-ssl.musicradio.com/HeartUK', favorite: true,
    },
    'heart-80s': {
      title: 'Heart 80s', url: 'https://www.heart.co.uk/80s',
      stream: 'https://media-ssl.musicradio.com/Heart80sMP3',
    },
  };
  const discovered = {
    'heart-uk-instant-audio': {
      title: 'Heart UK', url: 'https://www.heart.co.uk/',
      stream: 'http://media-ice.musicradio.com/HeartUKMP3',
    },
    'heart-80s-962e9a46': {
      title: 'Heart 80s', url: 'http://heart.co.uk/80s',
      stream: 'http://media-ice.musicradio.com/Heart80sMP3',
    },
    independent: {
      title: 'Heart UK', url: 'https://independent.example',
      stream: 'https://independent.example/stream',
    },
  };
  const merged = mergeStations(existing, discovered);
  assert.equal(merged.added, 1);
  assert.equal(merged.enriched, 2);
  assert.equal(Object.hasOwn(merged.stations, 'heart-uk-instant-audio'), false);
  assert.equal(Object.hasOwn(merged.stations, 'heart-80s-962e9a46'), false);
  assert.deepEqual(merged.stations['heart-uk'].streams.map(x => x.url), [
    'https://media-ssl.musicradio.com/HeartUK',
    'http://media-ice.musicradio.com/HeartUKMP3',
  ]);
  assert.equal(merged.stations['heart-uk'].favorite, true);
  assert.equal(Object.hasOwn(merged.stations, 'independent'), true);
});
