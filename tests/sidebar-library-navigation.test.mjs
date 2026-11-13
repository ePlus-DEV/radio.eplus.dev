import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { libraryTabFromHash, libraryTabHref } from '../utils/library-tabs.mjs';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('desktop sidebar owns all six Library destinations and retains collapse state', async () => {
  const sidebar = await read('components/AppSidebar.vue');
  assert.match(sidebar, /const libraryOpen = ref\(route\.path === '\/library'\)/);
  assert.match(sidebar, /libraryOpen = !libraryOpen/);
  assert.match(sidebar, /:aria-expanded="libraryOpen"/);
  assert.match(sidebar, /<nav v-show="libraryOpen"/);
  assert.match(sidebar, /libraryTabHref\(section\.value\)/);
  assert.match(sidebar, /libraryTabFromHash\(route\.hash\) === section\.value/);
  assert.match(sidebar, /:aria-current="route\.path === '\/library'/);
  assert.match(sidebar, /id="radio-library-subnav-desktop"/);
  for (const value of ['all', 'favorites', 'recent', 'collections', 'custom', 'stats']) {
    assert.match(sidebar, new RegExp("value: '" + value + "'"), value + ' submenu missing');
  }
  assert.match(sidebar, /label: 'library_navigation\.activity'/);
  assert.match(sidebar, /\$t\('redesign\.library'\)/);
});

test('old Library destinations remain stable and new ones are hash-backed', () => {
  assert.equal(libraryTabHref('all'), '/library');
  for (const value of ['favorites','recent','collections','custom','stats']) {
    assert.equal(libraryTabHref(value), '/library#' + value);
    assert.equal(libraryTabFromHash('#' + value), value);
  }
  assert.equal(libraryTabFromHash(''), 'all');
  assert.equal(libraryTabFromHash('#unknown'), 'all');
});

test('mobile More keeps public Statistics and Settings reachable without a second Library menu', async () => {
  const [sidebar, mobile] = await Promise.all([read('components/AppSidebar.vue'),read('components/MobileNavigation.vue')]);
  assert.match(sidebar, /v-if="!mobile" to="\/statistics"/);
  assert.match(sidebar, /v-if="!mobile" to="\/settings"/);
  assert.match(sidebar, /v-if="mobile"[\s\S]*?informationLinks/);
  assert.match(sidebar, /<NuxtLink to="\/settings"/);
  assert.match(mobile, /to="\/library"/);
  assert.match(sidebar, /watch\(\(\) => route\.path/);
});

test('Library switches between desktop sidebar and compact page navigation', async () => {
  const [sidebar, library, mobile] = await Promise.all([
    read('components/AppSidebar.vue'), read('pages/library.vue'), read('components/MobileNavigation.vue')
  ]);
  assert.match(sidebar, /<div v-if="!mobile" class="space-y-1">\s*<button type="button"/);
  assert.match(mobile, /<NuxtLink to="\/library"/);
  assert.match(library, /radio-library-tabs[^"]*xl:hidden/);
  assert.match(library, /v-for="tab in tabs"/);
  for (const value of ['all','favorites','recent','collections','custom','stats']) {
    assert.match(library, new RegExp("value: '" + value + "'"));
  }
  assert.match(library, /<PanelLibraryOverview v-if="active === 'all'"/);
  assert.match(library, /<PanelPersonalCollections v-else-if="active === 'collections'"/);
  assert.match(library, /<PanelCustomRadioStreams v-else-if="active === 'custom'"/);
});

test('all seven locales cover the six sections and distinct public statistics', async () => {
  for (const locale of ['vi-VN', 'en-US', 'ja-JP', 'fr-FR', 'ru-RU', 'zh-CN', 'zh-TW']) {
    const copy = JSON.parse(await read('lang/' + locale + '.json'));
    for (const label of [copy.redesign.library,copy.library_navigation.overview,copy.library_navigation.activity,
      copy.library.favorites,copy.library.recent,copy.collections.title,copy.custom_streams.title,copy.navmenu.statistics]) {
      assert.ok(typeof label === 'string' && label.trim(), locale + ': missing Library label');
    }
  }
});
