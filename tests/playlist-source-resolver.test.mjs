import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePlaylistSource } from '../utils/radio-playlist.mjs';

const playlist = { src: 'https://station.example/list.pls', type: 'audio/x-scpls' };

test('non-playlist streams do not fetch and keep object identity', async () => {
  const mp3 = { src: 'https://radio.example/live.mp3', type: 'audio/mpeg' };
  assert.equal(await resolvePlaylistSource(mp3, { fetchFn: () => { throw Error('unexpected fetch'); } }), mp3);
});

test('PLS resolves the first stream, preserving order and inferring MIME', async () => {
  let accepted, signal;
  const result = await resolvePlaylistSource(playlist, {
    fetchFn: async (url, options) => {
      accepted = options.headers.accept;
      signal = options.signal;
      assert.equal(url, playlist.src);
      return { ok: true, text: async () => '[playlist]\nFile1=https://radio.example/live.aac\nFile2=https://radio.example/backup.mp3' };
    },
  });
  assert.deepEqual(result, { src: 'https://radio.example/live.aac', type: 'audio/aac' });
  assert.equal(signal.aborted, false);
  assert.match(accepted, /audio\/x-scpls/);
});

test('HTTP errors, unsupported playlists and network errors retain source fallback', async () => {
  for (const fetchFn of [
    async () => ({ ok: false }),
    async () => ({ ok: true, text: async () => '#EXTM3U\nfile:///private/song' }),
    async () => { throw Error('network offline'); },
  ]) assert.equal(await resolvePlaylistSource(playlist, { fetchFn }), playlist);
});

test('timeout aborts the request and always clears the timer', async () => {
  let fire, cleared = false;
  const fallback = await resolvePlaylistSource(playlist, {
    setTimeoutFn: cb => { fire = cb; return 7; },
    clearTimeoutFn: id => { assert.equal(id, 7); cleared = true; },
    fetchFn: (_, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
      queueMicrotask(() => fire());
    }),
  });
  assert.equal(fallback, playlist);
  assert.equal(cleared, true);
});
