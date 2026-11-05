import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('Apple Music directory matches the refreshed card design with accessible working listen links', async () => {
  const page = await read('pages/global-radio/apple-music/index.vue');
  assert.match(page, /<header class="radio-hero relative isolate overflow-hidden/);
  assert.match(page, /radial-gradient\(/);
  assert.match(page, /grid min-w-0 gap-3 sm:grid-cols-2 2xl:grid-cols-3/);
  assert.match(page, /v-for="station in provider\?\.stations \|\| \[\]"/);
  assert.match(page, /:key="station\.id"/);
  assert.match(page, /station\.seasonal/);
  assert.match(page, /:href="station\.listen_url" target="_blank" rel="noopener noreferrer"/);
  assert.match(page, /:href="station\.tunein_url" target="_blank" rel="noopener noreferrer"/);
  assert.match(page, /:to="`\/global-radio\/apple-music\/\$\{station\.id\}`"/);
  assert.match(page, /t\('global_radio\.listen_on_apple'\)/);
  assert.match(page, /t\('global_radio\.listen_on_tunein'\)/);
  assert.match(page, /min-h-11 w-full/, 'primary action should be touch friendly');
  assert.match(page, /focus-visible:outline-2/, 'links must be keyboard accessible');
});

test('neither public list nor detail asks for signed HLS tokens; in-app play is configured-only', async () => {
  const [page, detail, catalog] = await Promise.all([
    read('pages/global-radio/apple-music/index.vue'),
    read('pages/global-radio/apple-music/[station].vue'),
    read('public/catalog/providers/apple-music.json'),
  ]);
  for (const publicPage of [page, detail]) {
    assert.doesNotMatch(publicPage, /GlobalRadioTemporaryHlsPreview|accessKey|\.m3u8|preview_on_eplus|preview_requires_url|TemporaryHlsPreview|<audio\b|<UModal\b/);
    assert.doesNotMatch(publicPage, /playback\.(activate|requestStation|play)|requestStation\(/);
    assert.match(publicPage, /rel="noopener noreferrer"/);
    assert.match(publicPage, /v-if="canListenOnEplus/);
    assert.match(publicPage, /useAuthorizedGlobalRadioPlayback/);
  }
  assert.match(detail, /useStaticPageSeo/);
  assert.match(page, /useStaticPageSeo/);
  assert.doesNotMatch(catalog, /accessKey|itsliveradio\.apple\.com|3p-tune-in/);
});

test('provider pages use real external links for all seven stations without fabricated playable state', async () => {
  const provider = JSON.parse(await read('public/catalog/providers/apple-music.json'));
  assert.equal(provider.stations.length, 7);
  assert.equal(provider.playback, 'external');
  for (const station of provider.stations) {
    assert.equal(new URL(station.listen_url).hostname, 'music.apple.com');
    assert.equal(new URL(station.tunein_url).hostname, 'tunein.com');
    assert.equal('stream' in station, false);
    assert.equal('streams' in station, false);
  }
});

test('all seven languages retain live destination and seasonal labels without obsolete token prompts', async () => {
  for (const locale of ['vi-VN', 'en-US', 'fr-FR', 'ja-JP', 'ru-RU', 'zh-CN', 'zh-TW']) {
    const lang = JSON.parse(await read('lang/' + locale + '.json'));
    for (const key of ['listen_on_apple', 'listen_on_tunein', 'details', 'seasonal', 'external_note', 'apple_access']) {
      assert.ok(typeof lang.global_radio?.[key] === 'string' && lang.global_radio[key].trim(), locale + ': missing ' + key);
    }
    assert.equal('preview_on_eplus' in lang.global_radio, false);
    assert.equal('preview_requires_url' in lang.global_radio, false);
  }
});
