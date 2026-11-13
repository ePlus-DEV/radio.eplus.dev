import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { inferMime, isTextPlaylist, parsePlaylistUrls } from '../utils/radio-playlist.mjs';

test('detects PLS and M3U text playlists but not HLS playlists', () => {
  for (const url of [
    'https://station.test/playlist.pls',
    'https://station.test/playlist.m3u?session=1',
    'https://station.test/listen?output=pls',
    'https://station.test/listen?format=pls&unused=yes',
  ]) assert.equal(isTextPlaylist(url), true, url);
  for (const url of [
    'https://station.test/hls/index.m3u8',
    'https://station.test/live.mp3',
    'https://station.test/listen?format=m3u8',
  ]) assert.equal(isTextPlaylist(url), false, url);
});

test('PLS and M3U parsing preserves source order, deduplicates URLs and ignores headers', () => {
  assert.deepEqual(parsePlaylistUrls([
    '[playlist]',
    'NumberOfEntries=2',
    'File1=https://example.net/stream.aac',
    'File2 = http://example.org/live.mp3',
    '#EXTM3U',
    'https://example.net/stream.aac',
    'Title1=Station',
    'Length1=-1',
    '',
  ].join('\n')), [
    'https://example.net/stream.aac',
    'http://example.org/live.mp3',
  ]);
});

test('playlist parser ignores empty lines and non-http(s) schemes', () => {
  assert.deepEqual(parsePlaylistUrls([
    '  ',
    '#EXTINF:-1, Radio',
    'javascript:alert(1)',
    'file:///tmp/private',
    'data:audio/mp3;base64,abc',
    'File1=javascript:alert(1)',
    '  https://example.net/live  ',
  ].join('\r\n')), ['https://example.net/live']);
});

test('inferMime honors recognized extensions, query strings and unknown fallback', () => {
  assert.equal(inferMime('https://x.test/live.m3u8?token=abc'), 'application/vnd.apple.mpegurl');
  assert.equal(inferMime('https://x.test/live.aac'), 'audio/aac');
  assert.equal(inferMime('https://x.test/live.ogg'), 'audio/ogg');
  assert.equal(inferMime('https://x.test/live.opus'), 'audio/opus');
  assert.equal(inferMime('https://x.test/live.mp3'), 'audio/mpeg');
  assert.equal(inferMime('https://x.test/live', 'audio/custom'), 'audio/custom');
  assert.equal(inferMime('https://x.test/live', ''), 'audio/mpeg');
});

test('global Player imports playlist resolution without duplicating transport', async () => {
  const player = await readFile(new URL('../components/player/Player.vue', import.meta.url), 'utf8');
  assert.match(player, /import \\{ resolvePlaylistSource \\} from ["']~\\/utils\\/radio-playlist\\.mjs["']/);
  assert.match(player, /await resolvePlaylistSource\\(rawSource\\)/);
  assert.doesNotMatch(player, /const resolvePlaylistSource = async \\(/);
  assert.doesNotMatch(player, /const parsePlaylistUrls = /);
  assert.doesNotMatch(player, /const isTextPlaylist = /);
});
