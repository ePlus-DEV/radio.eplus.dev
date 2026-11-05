import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseHlsId3Tag, extractHlsId3Tracks, createTimedHlsTrackBuffer, extractNativeHlsId3Track } from '../utils/hls-song-metadata.mjs';

const ascii = text => [...text].map(c => c.charCodeAt(0));
const safeSize = n => [(n >> 21) & 0x7f, (n >> 14) & 0x7f, (n >> 7) & 0x7f, n & 0x7f];
const bigSize = n => [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
const frame = (id, value, version = 3, encoding = 3) => {
  const bytes = [...new TextEncoder().encode(value)];
  const payload = [encoding, ...bytes];
  return [...ascii(id), ...(version === 4 ? safeSize(payload.length) : bigSize(payload.length)),
    0, 0, ...payload];
};
const makeTag = (frames, version = 3) => {
  const bytes = frames.flat();
  return new Uint8Array([...ascii('ID3'), version, 0, 0, ...safeSize(bytes.length), ...bytes]);
};
const title = (value, v = 3) => frame('TIT2', value, v);
const artist = (value, v = 3) => frame('TPE1', value, v);

test('extracts real ID3v2.3 and ID3v2.4 title and artist, including UTF-8', () => {
  const v3 = makeTag([title('Một bài hát'), artist('Ca sĩ A')]);
  const v4 = makeTag([title('Chanson été', 4), artist('Artiste B', 4)], 4);
  assert.deepEqual(parseHlsId3Tag(v3), { title: 'Một bài hát', artist: 'Ca sĩ A' });
  assert.deepEqual(parseHlsId3Tag(v4), { title: 'Chanson été', artist: 'Artiste B' });
});

test('missing or malformed metadata cannot impersonate a current song', () => {
  const invalid = [
    new Uint8Array(),
    new TextEncoder().encode('Apple Music 1'),
    makeTag([title('Only title')]),
    makeTag([artist('Only performer')]),
    makeTag([frame('TXXX', 'Artist - Song')]),
    makeTag([title('Same'), artist('Same')]),
    makeTag([title('Some title'), frame('PRIV', 'opaque stream marker')]),
  ];
  for (const tag of invalid) assert.equal(parseHlsId3Tag(tag), null);
  const badHeader = makeTag([title('Song'), artist('Singer')]);
  badHeader[6] = 0xff;
  assert.equal(parseHlsId3Tag(badHeader), null);
  const badFrame = makeTag([title('Song'), artist('Singer')]);
  badFrame[14] = 0x7f;
  assert.equal(parseHlsId3Tag(badFrame), null);
  assert.equal(parseHlsId3Tag(new Uint8Array(70_000)), null);
});

test('accepts only ID3 bytes and preserves timestamp for accurate live playback', () => {
  const data = makeTag([title('Song 1'), artist('Artist 1')]);
  assert.deepEqual(extractHlsId3Tracks([
    null,
    { data: 'Artist 2 - Song 2', pts: 2 },
    { data, pts: 42.25 },
    { data: makeTag([title('Missing artist')]), pts: 43 },
  ]), [{ title: 'Song 1', artist: 'Artist 1', pts: 42.25 }]);
  assert.deepEqual(extractHlsId3Tracks(null), []);
});

test('waits until media time reaches ID3 PTS and suppresses duplicate tracks', () => {
  const buffer = createTimedHlsTrackBuffer();
  const a = makeTag([title('First'), artist('Artist A')]);
  const b = makeTag([title('Second'), artist('Artist B')]);
  buffer.add([{ data: a, pts: 50 }, { data: b, pts: 70 }]);
  assert.equal(buffer.consume(20), null);
  assert.deepEqual(buffer.consume(49.6), { title: 'First', artist: 'Artist A' });
  assert.equal(buffer.consume(52), null);
  assert.deepEqual(buffer.consume(70), { title: 'Second', artist: 'Artist B' });
  buffer.add([{ data: b, pts: 71 }]);
  assert.equal(buffer.consume(72), null);
  buffer.clear();
  buffer.add([{ data: a, pts: 100 }]);
  assert.equal(buffer.consume(10), null);
  buffer.clear();
  assert.equal(buffer.consume(101), null);
});

test('Safari native timed ID3 cue extraction requires a concurrent title/artist pair', () => {
  const cue = (key, value) => ({ value: { key, data: new Uint8Array([3, ...new TextEncoder().encode(value)]) } });
  assert.deepEqual(extractNativeHlsId3Track([
    cue('TIT2', 'Song on Air'), cue('TPE1', 'Actual Artist'),
  ]), { title: 'Song on Air', artist: 'Actual Artist' });
  assert.equal(extractNativeHlsId3Track([cue('TIT2', 'Song Only')]), null);
  assert.equal(extractNativeHlsId3Track([cue('PRIV', 'Not a song'), cue('TPE1', 'Singer')]), null);
  assert.equal(extractNativeHlsId3Track([{ value: { key: 'TIT2', data: 'Title' } }]), null);
  assert.equal(extractNativeHlsId3Track(null), null);
});

test('wire actual hls.js metadata to existing player and queue, not another stream', async () => {
  const player = await readFile(new URL('../components/player/Player.vue', import.meta.url), 'utf8');
  const realtime = await readFile(new URL('../composables/useStationRealtime.ts', import.meta.url), 'utf8');
  const store = await readFile(new URL('../stores/playback.ts', import.meta.url), 'utf8');
  assert.match(player, /Hls\.Events\.FRAG_PARSING_METADATA/);
  assert.match(player, /attachNativeHlsSongMetadata\(media, version\)/);
  assert.match(player, /extractNativeHlsId3Track\(track\.activeCues\)/);
  assert.match(player, /detachNativeHlsMetadata\?\.\(\)/);
  assert.match(player, /hlsSongBuffer\.add\(data\?\.samples\)/);
  assert.match(player, /media\.addEventListener\("timeupdate", flushHlsSongMetadata\)/);
  assert.match(player, /media\.removeEventListener\("timeupdate", flushHlsSongMetadata\)/);
  assert.match(player, /playback\.setHlsLiveTrack\(stationUrl, track\)/);
  assert.match(player, /version !== sourceVersion \|\| userPaused\.value/);
  assert.match(store, /this\.liveTrack\.source === 'hls'/);
  assert.match(realtime, /track\.source !== 'hls'/);
  assert.match(realtime, /addTuneInSessionTrack\(playlist\.value, track\)/);
  assert.doesNotMatch(player, /fetch\([^)]*accessKey/);
});
