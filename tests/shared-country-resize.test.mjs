import test from 'node:test';
import assert from 'node:assert/strict';
import { observeCountrySize } from '../utils/shared-country-resize.mjs';

test('duplicate callback subscriptions remain active until both disposers run', () => {
  const previousWindow = globalThis.window;
  const previousObserver = globalThis.ResizeObserver;
  const listeners = new Map();
  let added = 0;
  let removed = 0;
  globalThis.window = {
    addEventListener(type, callback) {
      assert.equal(type, 'resize');
      listeners.set(type, callback);
      added++;
    },
    removeEventListener(type, callback) {
      assert.equal(listeners.get(type), callback);
      listeners.delete(type);
      removed++;
    },
  };
  globalThis.ResizeObserver = undefined;
  try {
    const element = {};
    let calls = 0;
    const callback = () => { calls++; };
    const disposeA = observeCountrySize(element, callback);
    const disposeB = observeCountrySize(element, callback);
    assert.equal(added, 1, 'one shared window resize listener');
    listeners.get('resize')();
    assert.equal(calls, 1, 'same callback is notified once per resize');

    disposeA();
    assert.equal(removed, 0, 'first disposer must not unsubscribe second subscriber');
    listeners.get('resize')();
    assert.equal(calls, 2);

    disposeB();
    assert.equal(removed, 1);
    assert.equal(listeners.has('resize'), false);
    disposeA();
    disposeB();
    assert.equal(removed, 1, 'disposers are idempotent');
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousObserver === undefined) delete globalThis.ResizeObserver;
    else globalThis.ResizeObserver = previousObserver;
  }
});
