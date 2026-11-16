import test from 'node:test';
import assert from 'node:assert/strict';
import { readPlayerStorage, writePlayerStorage } from '../utils/player-storage.mjs';

test('player storage round-trips persisted UI and volume values', () => {
  const values = new Map();
  const storage = () => ({
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
  });
  assert.equal(readPlayerStorage('radio:player-mini', storage), null);
  assert.equal(writePlayerStorage('radio:player-mini', '1', storage), true);
  assert.equal(readPlayerStorage('radio:player-mini', storage), '1');
  assert.equal(writePlayerStorage('radio:audio-preferences:v1', '{"volume":0.5}', storage), true);
  assert.equal(readPlayerStorage('radio:audio-preferences:v1', storage), '{"volume":0.5}');
});

test('player remains functional when storage access is blocked', () => {
  const denied = () => { throw new DOMException('Access denied', 'SecurityError'); };
  assert.equal(readPlayerStorage('radio:player-mini', denied), null);
  assert.equal(writePlayerStorage('radio:player-mini', '1', denied), false);
});

test('player tolerates getItem and setItem failures independently', () => {
  const storage = () => ({
    getItem: () => { throw new Error('get failed'); },
    setItem: () => { throw new Error('quota exceeded'); },
  });
  assert.equal(readPlayerStorage('radio:player-compact', storage), null);
  assert.equal(writePlayerStorage('radio:player-compact', '1', storage), false);
});
