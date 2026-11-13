import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('overview prefers saved stations over editing forms and never writes local data', async () => {
  const [page, overview] = await Promise.all([read('pages/library.vue'), read('components/panel/LibraryOverview.vue')]);
  assert.match(page, /<PanelLibraryOverview v-if="active === 'all'"/);
  assert.doesNotMatch(page, /<PanelPersonalCollections v-if="active === 'all'"/);
  assert.doesNotMatch(page, /<PanelCustomRadioStreams v-if="active === 'all'"/);
  assert.match(overview, /<PanelListeningLibrary compact/);
  assert.match(overview, /parseCollections\(localStorage\.getItem\(COLLECTIONS_KEY\)\)/);
  assert.match(overview, /parseCustomStreams\(localStorage\.getItem\(CUSTOM_STREAMS_STORAGE_KEY\)\)/);
  assert.doesNotMatch(overview, /localStorage\.setItem|\$fetch\(|gtag/);
  for (const section of ['favorites', 'collections', 'recent', 'custom', 'stats']) {
    assert.ok(overview.includes('/library#' + section), section + ' overview link missing');
  }
});

test('library remains private and old public routes and SEO logic are unchanged', async () => {
  const [library, stats] = await Promise.all([read('pages/library.vue'), read('pages/statistics.vue')]);
  assert.match(library, /config\.public\.noIndex \? 'noindex, nofollow, noarchive' : 'noindex, follow'/);
  assert.match(stats, /useStaticPageSeo\(\{ title, description \}\)/);
});

test('all seven locales have concise navigation labels and honest local stream caveat', async () => {
  for (const locale of ['vi-VN','en-US','fr-FR','ja-JP','ru-RU','zh-CN','zh-TW']) {
    const d = JSON.parse(await read('lang/' + locale + '.json'));
    for (const key of ['overview','activity','organize','browse','collections_hint','custom_hint','activity_hint']) {
      assert.ok(d.library_navigation[key]?.trim(), locale + '.' + key);
    }
    assert.match(d.library_navigation.custom_hint, /\{count\}/);
    assert.ok(!/not enabled yet|chưa được bật/i.test(d.custom_streams.disclaimer), locale);
  }
});
