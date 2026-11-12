import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../components/CookieConsent.vue', import.meta.url), 'utf8');

// Exercise the actual script callbacks with mocked Vue/Nuxt globals and storage.
function setup(storage) {
  const script = source.match(/<script setup lang="ts">([\\s\\S]*?)<\\/script>/)?.[1];
  assert.ok(script);
  const callbacks = [];
  const ref = value => ({ value });
  const window = { localStorage: storage, location: { hostname: 'radio.eplus.dev' } };
  const onMounted = callback => callbacks.push(callback);
  const useRuntimeConfig = () => ({ public: { ga4Enabled: true } });
  const runnable = script.replace(/: void/g, '');
  return new Function('ref', 'window', 'onMounted', 'useRuntimeConfig', 'callbacks',
    runnable + '\\nreturn { accept, visible, mounted: callbacks[0] };'
  )(ref, window, onMounted, useRuntimeConfig, callbacks);
}

test('tracking notice remains dismissible when storage access is blocked', () => {
  const storage = { getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('QuotaExceededError'); } };
  const notice = setup(storage);
  assert.doesNotThrow(() => notice.mounted());
  assert.equal(notice.visible.value, true);
  assert.doesNotThrow(() => notice.accept());
  assert.equal(notice.visible.value, false);
});

test('tracking notice honors persisted dismissal when storage is available', () => {
  let value = null;
  const storage = { getItem() { return value; }, setItem(key, next) { assert.equal(key, 'radio:tracking-notice-v2'); value = next; } };
  const notice = setup(storage);
  notice.mounted();
  assert.equal(notice.visible.value, true);
  notice.accept();
  assert.equal(value, 'dismissed');
  const reloaded = setup(storage);
  reloaded.mounted();
  assert.equal(reloaded.visible.value, false);
});
