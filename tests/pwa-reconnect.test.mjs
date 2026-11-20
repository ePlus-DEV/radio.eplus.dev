import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

async function offlinePageHarness({ reachable = false, hidden = false, validManifest = true, serviceWorkerFails = false } = {}) {
  const html = await read('public/offline.html');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'offline page must contain a self-contained reconnect script');

  const state = { reachable, validManifest };
  const windowEvents = new Map();
  const documentEvents = new Map();
  const timers = new Map();
  const requests = [];
  let reloadCount = 0;
  let nextTimerId = 1;

  const elements = Object.fromEntries(
    ['offline-title', 'offline-description', 'offline-note', 'retry', 'connection-state']
      .map(id => [id, {
        textContent: '', disabled: false, listeners: new Map(),
        addEventListener(name, listener) { this.listeners.set(name, listener); },
      }]),
  );

  const document = {
    hidden,
    documentElement: { lang: '' },
    getElementById: id => elements[id],
    addEventListener: (name, listener) => documentEvents.set(name, listener),
  };
  const window = {
    location: {
      origin: 'https://preview.radio.eplus.dev',
      pathname: '/pr-preview/pr-24/asia/viet-nam/station',
      reload: () => { reloadCount += 1; },
    },
    addEventListener: (name, listener) => windowEvents.set(name, listener),
  };
  const navigator = {
    language: 'vi-VN',
    serviceWorker: {
      getRegistration: async () => {
        if (serviceWorkerFails) throw new Error('Service worker lookup blocked');
        return { scope: 'https://preview.radio.eplus.dev/pr-preview/pr-24/' };
      },
    },
  };

  runInNewContext(script, {
    window, document, navigator, URL, AbortController,
    fetch: async (url, options) => {
      requests.push({ url, options });
      if (!state.reachable) throw new TypeError('Network unavailable');
      return {
        ok: true,
        json: async () => state.validManifest
          ? { name: 'ePlus OnAir', start_url: '../' }
          : { unexpected: 'captive portal' },
      };
    },
    setTimeout: (callback, delay) => {
      const id = nextTimerId++;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimeout: id => { timers.delete(id); },
  });

  return {
    elements,
    requests,
    timers,
    get reloadCount() { return reloadCount; },
    setReachable: value => { state.reachable = value; },
    setValidManifest: value => { state.validManifest = value; },
    setHidden: value => { document.hidden = value; },
    emitWindow: event => windowEvents.get(event)?.(),
    emitDocument: event => documentEvents.get(event)?.(),
    clickRetry: () => elements.retry.listeners.get('click')(),
    runRetryTimer: delay => {
      const entry = [...timers.entries()].find(([, timer]) => timer.delay === delay);
      assert.ok(entry, 'expected a ' + delay + 'ms retry timer');
      timers.delete(entry[0]);
      entry[1].callback();
    },
    flush: () => new Promise(resolve => setImmediate(resolve)),
  };
}

test('PWA offline shell verifies connectivity and automatically restores the original page', async () => {
  const page = await offlinePageHarness();
  await page.flush();
  assert.equal(page.reloadCount, 0);
  assert.equal(page.elements['connection-state'].textContent, 'Đang chờ kết nối mạng…');
  assert.deepEqual([...page.timers.values()].map(timer => timer.delay), [3_000]);

  page.setReachable(true);
  page.emitWindow('online');
  await page.flush();

  assert.equal(page.reloadCount, 1);
  assert.equal(page.elements['connection-state'].textContent, 'Đã có mạng. Đang mở lại radio…');
  assert.equal(page.requests.at(-1).url,
    'https://preview.radio.eplus.dev/pr-preview/pr-24/brand/site.webmanifest');
  assert.equal(page.requests.at(-1).options.cache, 'no-store');
  assert.equal(page.requests.at(-1).options.redirect, 'error');
  assert.equal(page.timers.size, 0, 'successful recovery stops all further probes');
});

test('PWA offline shell retries with bounded backoff without a reload loop', async () => {
  const page = await offlinePageHarness();
  await page.flush();
  assert.equal(page.requests.length, 1);
  for (const [before, next] of [[3_000, 6_000], [6_000, 12_000], [12_000, 15_000], [15_000, 15_000]]) {
    page.runRetryTimer(before);
    await page.flush();
    assert.deepEqual([...page.timers.values()].map(timer => timer.delay), [next]);
    assert.equal(page.reloadCount, 0);
  }

  page.setReachable(true);
  page.runRetryTimer(15_000); // Some browsers do not reliably fire online.
  await page.flush();
  assert.equal(page.reloadCount, 1);
});

test('manual Retry only reloads after an actual valid same-origin response', async () => {
  const page = await offlinePageHarness();
  await page.flush();
  page.setReachable(true);
  page.setValidManifest(false);
  page.clickRetry();
  await page.flush();
  assert.equal(page.reloadCount, 0, 'a bogus or captive-portal response is not recovery');

  page.setValidManifest(true);
  page.clickRetry();
  await page.flush();
  assert.equal(page.reloadCount, 1);
});

test('PWA offline shell suspends probing when hidden and checks on foreground', async () => {
  const page = await offlinePageHarness({ hidden: true, reachable: true });
  await page.flush();
  assert.equal(page.requests.length, 0);
  assert.equal(page.timers.size, 0);

  page.setHidden(false);
  page.emitDocument('visibilitychange');
  await page.flush();
  assert.equal(page.reloadCount, 1);
});

test('PWA offline shell survives denied service-worker lookup and retains preview scope', async () => {
  const page = await offlinePageHarness({ reachable: true, serviceWorkerFails: true });
  await page.flush();
  assert.equal(page.reloadCount, 1);
  assert.equal(page.requests[0].url,
    'https://preview.radio.eplus.dev/pr-preview/pr-24/brand/site.webmanifest');
});
