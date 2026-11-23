import test from 'node:test';
import assert from 'node:assert/strict';
import { createSearchIndexLoadState } from '../utils/search-index-load-state.mjs';

test('empty successful search index is still considered loaded', () => {
  const state = createSearchIndexLoadState();
  assert.equal(state.isLoaded(), false);
  const items = [];
  assert.equal(items.length, 0);
  state.markLoaded();
  assert.equal(state.isLoaded(), true);
});

test('failed search index load stays retryable', () => {
  const state = createSearchIndexLoadState();
  assert.equal(state.isLoaded(), false);
  // A rejected request must not call markLoaded().
  assert.equal(state.isLoaded(), false);
});

test('search index load state is isolated per component instance', () => {
  const first = createSearchIndexLoadState();
  const second = createSearchIndexLoadState();
  first.markLoaded();
  assert.equal(first.isLoaded(), true);
  assert.equal(second.isLoaded(), false);
});
