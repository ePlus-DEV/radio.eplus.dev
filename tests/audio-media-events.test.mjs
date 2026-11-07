import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { AUDIO_EVENT_NAMES, bindAudioMediaEvents } from '../utils/audio-media-events.mjs';

function fakeMedia() {
  const listeners = new Map();
  const added = [];
  const removed = [];
  return {
    listeners, added, removed,
    addEventListener(name, handler) {
      added.push([name, handler]);
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(handler);
    },
    removeEventListener(name, handler) {
      removed.push([name, handler]);
      listeners.get(name)?.delete(handler);
    },
    fire(name) {
      for (const listener of listeners.get(name) || []) listener();
    },
  };
}

test('exact player events bind once and cleanup removes the original listeners', () => {
  const media = fakeMedia();
  const calls = [];
  const handlers = Object.fromEntries(AUDIO_EVENT_NAMES.map(name => [name, () => calls.push(name)]));
  const detach = bindAudioMediaEvents(media, handlers);
  assert.equal(media.added.length, AUDIO_EVENT_NAMES.length);
  for (const name of AUDIO_EVENT_NAMES) {
    assert.equal(media.listeners.get(name).size, 1, name);
    media.fire(name);
  }
  assert.deepEqual(calls, AUDIO_EVENT_NAMES);
  detach();
  detach();
  assert.equal(media.removed.length, AUDIO_EVENT_NAMES.length, 'teardown must be idempotent');
  for (const name of AUDIO_EVENT_NAMES) {
    assert.equal(media.listeners.get(name).size, 0, name);
    media.fire(name);
  }
  assert.deepEqual(calls, AUDIO_EVENT_NAMES, 'events cannot fire after teardown');
});

test('invalid handlers fail before adding any listeners', () => {
  const media = fakeMedia();
  assert.throws(() => bindAudioMediaEvents(null, {}), TypeError);
  assert.throws(() => bindAudioMediaEvents(media, {}), /All audio event handlers/);
  assert.equal(media.added.length, 0);
});

test('global Player keeps lifecycle ownership and clears old handlers on rebind', async () => {
  const source = await readFile(new URL('../components/player/Player.vue', import.meta.url), 'utf8');
  const start = source.indexOf('const bindMediaEvents = (): void => {');
  const end = source.indexOf('watch(() => preferences.autoReconnect', start);
  const block = source.slice(start, end);
  assert.ok(start > 0 && end > start);
  assert.match(block, /detachMediaEvents\(\);/);
  assert.match(block, /detachMediaEvents = bindAudioMediaEvents\(media, \{/);
  for (const name of AUDIO_EVENT_NAMES) {
    assert.match(block, new RegExp(name + ': '));
  }
  assert.match(block, /timeupdate: flushHlsSongMetadata/);
  assert.match(block, /const unbindMediaEvents = \(\): void => \{/);
  assert.match(source, /bindMediaEvents\(\);/);
  assert.match(source, /unbindMediaEvents\(\);/);
  assert.doesNotMatch(block, /media\.addEventListener|media\.removeEventListener/,
    'all registered audio listeners should use exactly one cleanup owner');
});
