import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('every Apple Music card offers an in-app HLS preview, never a false one-click live play action', async () => {
  const page = await read('pages/global-radio/apple-music/index.vue');
  assert.ok(page.includes('v-for="station in provider?.stations || []"'), 'only actual catalog stations are listed');
  assert.ok(page.includes('@click="openPreview(station)"'), 'card preview action missing');
  assert.ok(page.includes("t('global_radio.preview_on_eplus')"), 'honest CTA copy missing');
  assert.ok(page.includes("t('global_radio.preview_requires_url')"), 'signed URL requirement must be visible');
  assert.ok(page.includes('v-model:open="previewOpen"'), 'preview must be a real modal');
  assert.ok(page.includes(':station="previewStation" :expanded="true"'), 'selected card must bind to the correct station');
  assert.ok(page.includes('v-if="previewOpen && previewStation"'), 'closed modal must unmount the audio player');
  assert.ok(page.includes('if (!open) previewStation.value = null;'), 'closing modal must discard the station preview');
  assert.ok(page.includes('radio-station-stats-modal'), 'modal should inherit shared dark/light palette');
  assert.ok(page.includes('max-h-[75dvh] overflow-y-auto'), 'modal content must not overflow on phone');
  assert.ok(page.includes('min-h-11 w-full'), 'in-app action should be large enough for touch');
});

test('Apple Music and TuneIn links remain external fallback, without modifying real radio playback', async () => {
  const [page, preview, catalog] = await Promise.all([
    read('pages/global-radio/apple-music/index.vue'),
    read('components/global-radio/TemporaryHlsPreview.vue'),
    read('public/catalog/providers/apple-music.json'),
  ]);
  assert.ok(page.includes('t(\'global_radio.listen_on_apple\')'));
  assert.ok(page.includes('t(\'global_radio.listen_on_tunein\')'));
  assert.ok(page.includes('target="_blank" rel="noopener noreferrer"'));
  assert.ok(preview.includes(':open="expanded"'), 'card modal should open preview form immediately');
  assert.ok(preview.includes('expanded?: boolean'), 'detail page preview stays collapsed by default');
  assert.ok(preview.includes('onBeforeUnmount(stopPreview)'));
  assert.ok(preview.includes("temporaryUrl.value = ''"));
  assert.ok(!catalog.includes('accessKey'), 'must not commit signed Apple URLs');
  assert.ok(!page.includes('playback.activate(') && !page.includes('requestStation('),
    'provider cards must never send Apple page URLs to global audio engine');
});

test('preview label and signed URL warning exist in all seven language packs', async () => {
  for (const locale of ['en-US', 'vi-VN', 'ja-JP', 'fr-FR', 'ru-RU', 'zh-CN', 'zh-TW']) {
    const lang = JSON.parse(await read('lang/' + locale + '.json'));
    for (const key of ['preview_on_eplus', 'preview_requires_url']) {
      assert.ok(typeof lang.global_radio?.[key] === 'string' && lang.global_radio[key].trim(), locale + ': ' + key);
    }
  }
});
