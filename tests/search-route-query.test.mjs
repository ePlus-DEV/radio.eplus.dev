import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseSearchQueryParam } from '../utils/search-route-query.mjs';

test('search handles Vue Router nullable and repeated q values without crashing', () => {
  assert.equal(parseSearchQueryParam('  vov  '), 'vov');
  assert.equal(parseSearchQueryParam(null), '');
  assert.equal(parseSearchQueryParam(undefined), '');
  assert.equal(parseSearchQueryParam(['vov', 'heart']), 'vov');
  assert.equal(parseSearchQueryParam([null, 'vov']), 'vov');
  assert.equal(parseSearchQueryParam(['', '  heart uk  ']), 'heart uk');
  assert.equal(parseSearchQueryParam([null, '', null]), '');
  assert.equal(parseSearchQueryParam([]), '');
  assert.equal(parseSearchQueryParam(['  ', null, '  VOV Giao Thông ']), 'VOV Giao Thông');
});

test('search page uses the safe parser rather than trimming the first q entry', async () => {
  const page = await readFile(new URL('../pages/search.vue', import.meta.url), 'utf8');
  assert.match(page, /parseSearchQueryParam\(route\.query\.q\)/);
  assert.doesNotMatch(page, /raw\[0\][^\n]*\.trim\(/);
  assert.match(page, /'noindex, follow'/, 'existing production utility-page SEO policy remains');
});
