import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('Apple directory reuses the exact Country card grid, Play control and separate detail links', async () => {
  const page = await read('pages/global-radio/apple-music/index.vue');
  const shared = await read('components/panel/Station.vue');
  assert.match(page, /<header class="radio-hero relative isolate overflow-hidden/);
  assert.match(page, /radial-gradient\(/);
  assert.match(page, /<PanelStation[\s\S]*:stations="stationCards"[\s\S]*@select-station="playSelectedStation"/);
  assert.match(shared, /grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 lg:grid-cols-4 2xl:grid-cols-5/);
  assert.match(shared, /:prefetch="false"/);
  assert.match(shared, /<CountryMarquee :text="station\.title" \/>/);
  assert.match(shared, /radio-card-compact-station-play/);
  const css = await read('assets/css/main.css');
  assert.match(css, /\.radio-card-compact-station-play\s*\{\s*@apply[^;]*h-11 w-11/);
  assert.match(shared, /@click="emit\('select-station', station\)"/);
  assert.match(shared, /isPending\(station\) \|\| isConnecting\(station\) \? 'i-lucide-loader-circle'/);
  assert.match(page, /t\('global_radio\.eplus_play_hint'\)/);
  assert.doesNotMatch(page, /:href="station\.(?:listen_url|tunein_url)"/,
    'Apple Music and TuneIn external links only appear on station detail');
  assert.doesNotMatch(page, /t\('global_radio\.external_note'\)/);
});

test('directory/detail use shared player without raw HLS prompts; provider links are detail-only', async () => {
  const [page, detail, catalog] = await Promise.all([
    read('pages/global-radio/apple-music/index.vue'),
    read('pages/global-radio/apple-music/[station].vue'),
    read('public/catalog/providers/apple-music.json'),
  ]);
  for (const publicPage of [page, detail]) {
    assert.doesNotMatch(publicPage, /GlobalRadioTemporaryHlsPreview|accessKey|\.m3u8|preview_on_eplus|preview_requires_url|TemporaryHlsPreview|<audio\b|<UModal\b/);
    assert.doesNotMatch(publicPage, /playback\.(?:activate|requestStation|play)\s*\(|requestStation\(/);

    assert.doesNotMatch(publicPage, /v-if="canListenOnEplus/, 'missing proxy must not hide the Play control');
    assert.match(publicPage, /v-if="!canListenOnEplus"/, 'explain why the Play button is disabled');
    assert.match(publicPage, /global_radio\.resolver_unavailable/);
    assert.match(publicPage, /useAuthorizedGlobalRadioPlayback/);
  }
  assert.match(page, /:play-enabled="canListenOnEplus"/);
  assert.match(page, /:pending-station-id="pendingStationId"/);
  assert.match(detail, /:disabled="!canListenOnEplus \|\| Boolean\(pendingStationId\)"/);
  assert.match(detail, /rel="noopener noreferrer"/);
  assert.match(detail, /:href="station\.listen_url"/);
  assert.match(detail, /:href="station\.tunein_url"/);
  assert.match(detail, /t\('global_radio\.other_listening_options'\)/);
  assert.match(detail, /t\('global_radio\.external_options_hint'\)/);
  assert.doesNotMatch(detail, /t\('global_radio\.external_badge'\)/);
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
    for (const key of [
      'listen_on_eplus', 'listen_on_apple', 'listen_on_tunein', 'details', 'seasonal',
      'external_note', 'apple_access', 'eplus_play_hint', 'playing_now',
      'other_listening_options', 'external_options_hint',
    ]) {
      assert.ok(typeof lang.global_radio?.[key] === 'string' && lang.global_radio[key].trim(), locale + ': missing ' + key);
    }
    assert.equal('preview_on_eplus' in lang.global_radio, false);
    assert.equal('preview_requires_url' in lang.global_radio, false);
  }
});

test('Apple Music preview prerenders in-app player QA routes and keeps custom noindex', async () => {
  const routes = await read('utils/pr-preview.mjs');
  const config = await read('nuxt.config.ts');
  const workflow = await read('.github/workflows/pr-preview-pages.yml');
  for (const path of [
    '/global-radio', '/global-radio/apple-music',
    '/global-radio/apple-music/apple-music-holiday-hits',
  ]) {
    assert.ok(routes.includes("'" + path + "'"), 'missing preview route ' + path);
  }
  assert.match(config, /routes: isPrPreview \? \[\.\.\.PR_PREVIEW_ROUTES/);
  assert.match(workflow, /NUXT_PUBLIC_NO_INDEX: 'true'/);
  // Public vars live in the dedicated Preview Environment (legacy development fallback).
  // Only the trusted pre-build job may access that Environment; never checkout
  // or run untrusted PR code in a job that also holds deploy credentials.
  const trusted = workflow.split('  preview_config:')[1]?.split('\n  build:')[0];
  const build = workflow.split('  build:')[1]?.split('\n  publish:')[0];
  assert.ok(trusted && build, 'trusted config and isolated build jobs exist');
  assert.match(trusted, /environment:\s*\n\s*name: \$\{\{ vars\.PAGES_PREVIEW_READY == 'true' && 'preview' \|\| 'development' \}\}/);
  assert.match(trusted, /CORS_SERVER: \$\{\{ vars\.NUXT_PUBLIC_CORS_SERVER_1 \}\}/);
  assert.match(trusted, /RESOLVER_URL: \$\{\{ vars\.NUXT_PUBLIC_GLOBAL_RADIO_RESOLVER_URL \}\}/);
  assert.doesNotMatch(trusted, /actions\/checkout|npm ci|secrets\./,
    'the trusted job cannot checkout or execute untrusted code or expose secrets');
  assert.match(build, /needs: \[preview_config, comment_status\]/);
  assert.match(build, /NUXT_PUBLIC_CORS_SERVER_1: \$\{\{ needs\.preview_config\.outputs\.cors_server \}\}/);
  assert.match(build, /NUXT_PUBLIC_GLOBAL_RADIO_RESOLVER_URL: \$\{\{ needs\.preview_config\.outputs\.resolver_url \}\}/);
  assert.doesNotMatch(build, /\n\s*environment:|secrets\.PAGES_DEPLOY_TOKEN/,
    'untrusted build must never receive Preview secrets or Environment access');
});
