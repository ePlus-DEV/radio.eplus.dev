import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { paginateStationResults, SEARCH_RESULTS_PAGE_SIZE } from '../utils/search-pagination.mjs';

test('Search results show the truthful match count for empty and small queries', () => {
  assert.deepEqual(paginateStationResults([], 1), { items: [], shown: 0, total: 0, hasMore: false });
  const one = [{ url: '/one' }];
  assert.deepEqual(paginateStationResults(one, 1), { items: one, shown: 1, total: 1, hasMore: false });
  assert.deepEqual(paginateStationResults(null, 1), { items: [], shown: 0, total: 0, hasMore: false });
});

test('Search starts at 100 and incrementally reveals all 101, 250, or 1000 matches', () => {
  const all = Array.from({ length: 1000 }, (_, i) => ({ url: '/station-' + i }));
  const exactHundred = paginateStationResults(all.slice(0, 100), 1);
  assert.equal(exactHundred.shown, 100);
  assert.equal(exactHundred.total, 100);
  assert.equal(exactHundred.hasMore, false);

  const hundredOne = paginateStationResults(all.slice(0, 101), 1);
  assert.equal(hundredOne.shown, SEARCH_RESULTS_PAGE_SIZE);
  assert.equal(hundredOne.total, 101);
  assert.equal(hundredOne.hasMore, true);
  assert.deepEqual(paginateStationResults(all.slice(0, 101), 2).items, all.slice(0, 101));

  const first = paginateStationResults(all.slice(0, 250), 1);
  const second = paginateStationResults(all.slice(0, 250), 2);
  const third = paginateStationResults(all.slice(0, 250), 3);
  assert.deepEqual([first.shown, second.shown, third.shown], [100, 200, 250]);
  assert.equal(third.hasMore, false);
  assert.equal(paginateStationResults(all, 10).shown, 1000);
  assert.equal(paginateStationResults(all, 10).hasMore, false);
  assert.equal(paginateStationResults(all, 0).shown, 100);
  assert.equal(paginateStationResults(all, NaN).shown, 100);
  assert.deepEqual(all[0], { url: '/station-0' }, 'the original match order is unchanged');
});

test('Full search page resets pagination on query and keeps index loading, SEO and URL unchanged', async () => {
  const page = await readFile(new URL('../pages/search.vue', import.meta.url), 'utf8');
  assert.match(page, /paginateStationResults\(allResults\.value, visiblePages\.value\)/);
  assert.match(page, /searchLocalStations\(index\.value, query\.value, index\.value\.length\)/);
  assert.match(page, /watch\(query, \(\) => \{ visiblePages\.value = 1; \}\)/);
  assert.match(page, /v-if="pagination\.hasMore"/);
  assert.match(page, /visiblePages \+= 1/);
  assert.match(page, /search\.showing_results/);
  assert.match(page, /search\.load_more/);
  assert.match(page, /config\.public\.noIndex \? 'noindex, nofollow, noarchive' : 'noindex, follow'/);
  assert.match(page, /router\.replace\(\{ path: '\/search', query:/);
});

test('All seven locales label the real displayed/total counts and Load more action', async () => {
  for (const locale of ['en-US','vi-VN','fr-FR','ja-JP','ru-RU','zh-CN','zh-TW']) {
    const lang = JSON.parse(await readFile(new URL('../lang/' + locale + '.json', import.meta.url), 'utf8'));
    assert.match(lang.search.showing_results, /\{shown\}/, locale);
    assert.match(lang.search.showing_results, /\{total\}/, locale);
    assert.ok(lang.search.load_more?.trim(), locale);
  }
});
