import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pageSkeletonKind } from '../utils/page-skeleton.mjs';

const read = path => readFile(join(process.cwd(), path), 'utf8');

test('PanelStation toolbar is opt-in via filterable and only the country page enables it', async () => {
  const [panel, countryPage, stationPage, globalPage] = await Promise.all([
    read('components/panel/Station.vue'),
    read('pages/[area]/[country]/index.vue'),
    read('pages/[area]/[country]/[station].vue'),
    read('pages/global-radio/apple-music/index.vue'),
  ]);

  // Prop defaults off so station-detail and Global Radio usages are unchanged.
  assert.match(panel, /filterable\?: boolean/);
  assert.match(panel, /filterable: false/);
  // Toolbar and filtered rendering are wired to the pure helper.
  assert.match(panel, /v-if="filterable"/);
  assert.match(panel, /filterAndSortStations\(props\.stations, filterQuery\.value, sortMode\.value\)/);
  assert.match(panel, /v-for="station in visibleStations"/);
  assert.match(panel, /panel\.filter_stations/);
  assert.match(panel, /panel\.clear_filter/);
  // Count badge distinguishes a filtered subset from the full catalog size.
  assert.match(panel, /visibleStations\.length\} \/ \$\{stations\.length\}/);

  assert.match(countryPage, /<PanelStation[\s\S]*?filterable\s/);
  assert.doesNotMatch(stationPage, /filterable/);
  assert.doesNotMatch(globalPage, /filterable/);
});

test('search page is a noindex utility page over the local index, capped at 100 results', async () => {
  const page = await read('pages/search.vue');
  // Same robots pattern as pages/library.vue: follow on indexable envs,
  // stricter when the deployment is noindex.
  assert.match(page, /config\.public\.noIndex \? 'noindex, nofollow, noarchive' : 'noindex, follow'/);
  assert.match(page, /search\.results_title/);
  assert.match(page, /useStationSearchIndex\(\)/);
  assert.match(page, /searchLocalStations\(index\.value, query\.value, 100\)/);
  assert.match(page, /<SearchResult :result="results" \/>/);
  assert.match(page, /search\.loading/);
  assert.match(page, /search\.unavailable/);
  assert.match(page, /panel\.no_channels/);
  assert.match(page, /<ClientOnly>/);
  // The URL query is the source of truth, updated via router.replace.
  assert.match(page, /route\.query\.q/);
  assert.match(page, /router\.replace\(\{ path: '\/search', query:/);
});

test('/search prerenders like the other utility pages but stays out of SEO surfaces', async () => {
  const config = await read('nuxt.config.ts');
  const routesBlock = config.slice(config.indexOf('"/library"'), config.indexOf('"/robots.txt"'));
  assert.match(routesBlock, /"\/settings",\s*"\/search",/);
  // No sitemap/structured-data advertising for the search utility route.
  assert.doesNotMatch(config, /SearchAction/);
  // The reserved route must not fall through to the generic area skeleton.
  assert.equal(pageSkeletonKind('/search'), 'info');
  assert.equal(pageSkeletonKind('/search?q=vov'), 'info');
});

test('search box Enter and view-all both navigate to the full results page', async () => {
  const box = await read('components/search/Box.vue');
  assert.match(box, /@keydown\.enter="goToResults"/);
  assert.match(box, /search\.view_all/);
  assert.match(box, /v-if="input\.trim\(\) && displayHits\.length > 0"/);
  assert.match(box, /navigateTo\(\{ path: "\/search", query: \{ q: term \} \}\)/);
  // Empty or whitespace input must never navigate.
  const handler = box.slice(box.indexOf('const goToResults'), box.indexOf('const handleSelect'));
  assert.match(handler, /const term = input\.value\.trim\(\);\s*if \(!term\) return;/);
  assert.match(handler, /rememberSearch\(term\)/);
  assert.match(handler, /resultsOpen\.value = false/);
  assert.match(handler, /emit\("close"\)/);
});

test('all seven locales carry the P2 filter and search strings', async () => {
  const locales = ['en-US', 'vi-VN', 'ja-JP', 'zh-CN', 'zh-TW', 'fr-FR', 'ru-RU'];
  for (const locale of locales) {
    const lang = JSON.parse(await read(`lang/${locale}.json`));
    for (const key of ['filter_stations', 'sort_default', 'sort_az', 'sort_za', 'clear_filter']) {
      assert.equal(typeof lang.panel[key], 'string', `${locale} panel.${key}`);
      assert.ok(lang.panel[key].trim().length > 0, `${locale} panel.${key} must not be empty`);
    }
    for (const key of ['results_title', 'view_all']) {
      assert.equal(typeof lang.search[key], 'string', `${locale} search.${key}`);
      assert.ok(lang.search[key].trim().length > 0, `${locale} search.${key} must not be empty`);
    }
  }
  const en = JSON.parse(await read('lang/en-US.json'));
  const vi = JSON.parse(await read('lang/vi-VN.json'));
  assert.equal(en.panel.filter_stations, 'Filter stations by name…');
  assert.equal(vi.panel.filter_stations, 'Lọc đài theo tên…');
  assert.equal(en.search.results_title, 'Search results');
  assert.equal(vi.search.results_title, 'Kết quả tìm kiếm');
  assert.equal(en.search.view_all, 'View all results');
  assert.equal(vi.search.view_all, 'Xem tất cả kết quả');
});
