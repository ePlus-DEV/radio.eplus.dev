import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
const getManifest = async () => JSON.parse(await read('public/brand/site.webmanifest'));

function workerHarness(source) {
  const handlers = {};
  const saved = [];
  const deleted = [];
  const cacheKeys = ['onair-offline-shell-v0', 'onair-offline-shell-v1', 'some-other-app'];
  let online = true;
  const offlineResponse = { status: 200, offline: true };
  const cache = {
    add: async request => { saved.push(request.url || request); },
  };
  const caches = {
    open: async name => { assert.equal(name, 'onair-offline-shell-v1'); return cache; },
    keys: async () => cacheKeys,
    delete: async name => { deleted.push(name); return true; },
    match: async url => url === 'https://radio.example/pr-preview/pr-2/offline.html'
      ? offlineResponse : undefined,
  };
  const fakeSelf = {
    registration: { scope: 'https://radio.example/pr-preview/pr-2/' },
    addEventListener: (event, listener) => { handlers[event] = listener; },
  };
  runInNewContext(source, {
    self: fakeSelf, caches, URL, Request, Response,
    fetch: async request => {
      if (!online) throw new TypeError('Network unavailable');
      return { status: 200, url: request.url };
    },
  });
  return {
    handlers, saved, deleted, setOnline: value => { online = value; },
    run: async (name, event) => {
      let pending;
      handlers[name]({ ...event, waitUntil: p => { pending = p; } });
      if (pending) await pending;
    },
  };
}

test('manifest starts within the current GitHub Pages deployment, including previews', async () => {
  const manifest = await getManifest();
  assert.equal(manifest.name, 'ePlus OnAir — Listen Beyond Borders.');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.id, '../');
  assert.equal(manifest.scope, '../');
  assert.equal(manifest.start_url, '../');
  assert.deepEqual(manifest.icons.map(icon => icon.sizes), ['192x192', '512x512']);
  for (const base of [
    'https://radio.eplus.dev/',
    'https://stg.radio.eplus.dev/',
    'https://preview.radio.eplus.dev/pr-preview/pr-2/',
  ]) {
    const url = new URL('brand/site.webmanifest', base);
    assert.equal(new URL(manifest.scope, url).href, base);
    assert.equal(new URL(manifest.start_url, url).href, base);
    for (const shortcut of manifest.shortcuts) {
      assert.ok(new URL(shortcut.url, url).href.startsWith(base));
    }
    assert.ok(new URL(manifest.icons[0].src, url).href.startsWith(base + 'brand/'));
  }
});

test('service worker caches only the noindex offline explanation, not stations or audio', async () => {
  const source = await read('public/service-worker.js');
  const worker = workerHarness(source);
  await worker.run('install');
  assert.deepEqual(worker.saved, ['https://radio.example/pr-preview/pr-2/offline.html']);
  assert.doesNotMatch(source, /skipWaiting|clients\.claim|cache\.put/);
  await worker.run('activate');
  assert.deepEqual(worker.deleted, ['onair-offline-shell-v0']);

  for (const request of [
    { mode: 'no-cors', method: 'GET', destination: 'audio', url: 'https://stream.example/live.mp3' },
    { mode: 'cors', method: 'GET', destination: '', url: 'https://radio.example/search/stations.json' },
    { mode: 'cors', method: 'GET', destination: '', url: 'https://stream.example/live.m3u8' },
    { mode: 'navigate', method: 'POST', destination: 'document', url: 'https://radio.example/' },
  ]) {
    worker.handlers.fetch({ request, respondWith: () => { throw Error('must not handle'); } });
  }
});

test('online navigations always fetch fresh HTML; offline navigations display fallback', async () => {
  const worker = workerHarness(await read('public/service-worker.js'));
  const request = { mode: 'navigate', method: 'GET', url: 'https://radio.example/pr-preview/pr-2/asia/viet-nam' };
  let response;
  worker.handlers.fetch({ request, respondWith: p => { response = p; } });
  assert.equal((await response).url, request.url);

  worker.setOnline(false);
  worker.handlers.fetch({ request, respondWith: p => { response = p; } });
  assert.equal((await response).offline, true);
});

test('registration is build-only, path scoped and never reloads an existing player', async () => {
  const plugin = await read('plugins/onair-pwa.client.ts');
  const config = await read('nuxt.config.ts');
  assert.match(plugin, /import\.meta\.dev/);
  assert.match(plugin, /useSiteAssetUrl\(\)\('\/service-worker\.js'\)/);
  assert.match(plugin, /useRuntimeConfig\(\)\.app\.baseURL/);
  assert.match(plugin, /navigator\.serviceWorker\.register\(serviceWorkerUrl, \{ scope \}\)/);
  assert.doesNotMatch(plugin, /window\.location\.reload|skipWaiting/);
  assert.match(config, /staticAsset\("\/brand\/site\.webmanifest"\)/);
});

test('offline HTML explicitly refuses offline radio, is noindex and is self-contained', async () => {
  const html = await read('public/offline.html');
  assert.match(html, /<meta name="robots" content="noindex, nofollow, noarchive">/);
  assert.match(html, /Live stations cannot play offline/);
  for (const locale of ['en', 'vi', 'ja', 'zh-CN', 'zh-TW', 'fr', 'ru']) {
    assert.ok(html.includes(locale + ':' ) || html.includes('"' + locale + '":'), 'missing offline copy for ' + locale);
  }
  assert.doesNotMatch(html, /<(?:script|link)[^>]+(?:src|href)=["']https?:\/\//i);
  assert.match(html, /env\(safe-area-inset-bottom\)/);
  assert.match(html, /window\.location\.reload\(\)/);
});
