import test from 'node:test';
import assert from 'node:assert/strict';
import { createTimedHlsTrackBuffer } from '../utils/hls-song-metadata.mjs';

const ascii = value => [...new TextEncoder().encode(value)];
const safeSize = size => [(size >> 21) & 127, (size >> 14) & 127, (size >> 7) & 127, size & 127];
const frame = (id, value) => {
  const payload = [3, ...ascii(value)];
  return [...ascii(id), 0, 0, 0, payload.length, 0, 0, ...payload];
};
const song = (title, artist) => {
  const frames = [...frame('TIT2', title), ...frame('TPE1', artist)];
  return new Uint8Array([...ascii('ID3'), 3, 0, 0, ...safeSize(frames.length), ...frames]);
};

test('untimed metadata cannot overwrite an already displayed timed HLS song', () => {
  const buffer = createTimedHlsTrackBuffer();
  buffer.add([{ data: song('Current', 'Artist B'), pts: 120 }]);
  assert.deepEqual(buffer.consume(120), { title: 'Current', artist: 'Artist B' });
  buffer.add([{ data: song('Stale unknown', 'Artist A') }]);
  assert.equal(buffer.consume(121), null);
  buffer.add([{ data: song('Next', 'Artist C'), pts: 130 }]);
  assert.deepEqual(buffer.consume(130), { title: 'Next', artist: 'Artist C' });
});

test('untimed HLS metadata still works before timed samples, and after reset', () => {
  const buffer = createTimedHlsTrackBuffer();
  buffer.add([{ data: song('Untimed first', 'Artist A') }]);
  assert.deepEqual(buffer.consume(0), { title: 'Untimed first', artist: 'Artist A' });
  buffer.add([{ data: song('Timed second', 'Artist B'), pts: 30 }]);
  assert.deepEqual(buffer.consume(30), { title: 'Timed second', artist: 'Artist B' });
  buffer.clear();
  buffer.add([{ data: song('Untimed after reset', 'Artist C') }]);
  assert.deepEqual(buffer.consume(0), { title: 'Untimed after reset', artist: 'Artist C' });
});
