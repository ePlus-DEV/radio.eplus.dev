import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('both Apple Music pages disclose the disabled in-app player when resolver is absent', async () => {
  const index = await read('pages/global-radio/apple-music/index.vue');
  const detail = await read('pages/global-radio/apple-music/[station].vue');
  for (const page of [index, detail]) {
    assert.match(page, /v-if="!canListenOnEplus"/);
    assert.match(page, /global_radio\.playback_status_title/);
    assert.match(page, /global_radio\.playback_status_pending/);
    assert.match(page, /v-if="canListenOnEplus/);
    assert.match(page, /:href="station\.listen_url"/);
    assert.match(page, /:href="station\.tunein_url"/);
    assert.doesNotMatch(page, /<audio\b|accessKey|\.m3u8/);
    assert.match(page, /useStaticPageSeo/);
  }
  assert.match(index, /global_radio\.playback_status_short/);
});

test('the global radio service-state copy exists across supported locales', async () => {
  const keys = ['playback_status_title','playback_status_pending','playback_status_short','playback_status_configured'];
  for (const locale of ['vi-VN','en-US','fr-FR','ja-JP','ru-RU','zh-CN','zh-TW']) {
    const dict = JSON.parse(await read('lang/' + locale + '.json'));
    for (const key of keys) {
      assert.ok(typeof dict.global_radio?.[key] === 'string' && dict.global_radio[key].trim(), locale + ' missing ' + key);
    }
  }
});
