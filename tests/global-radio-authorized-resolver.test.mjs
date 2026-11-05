import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildAuthorizedResolverRequest, validateAuthorizedAppleStream, resolveAuthorizedAppleStream } from '../utils/global-radio-resolver.mjs';
import { createAuthorizedApplePlaybackStation } from '../utils/global-radio-station.mjs';

const station = { id: 'apple-music-1', title: 'Apple Music 1',
  listen_url: 'https://music.apple.com/us/station/apple-music-1/ra.978194965' };
const now = Date.UTC(2026, 10, 5, 12);
const expires = Math.floor(now / 1000) + 600;
const appleStream = `https://itsliveradio.apple.com/3p-tune-in/tune_in/978194965/usw/256.m3u8?accessKey=${expires}_opaque_signature`;
const valid = { status: 'ok', authorized: true, provider: 'apple-music',
  station_id: station.id, stream_url: appleStream, expires_at: expires + 100 };

test('resolver URL requires HTTPS, fixed station slug and no caller query', () => {
  assert.equal(buildAuthorizedResolverRequest('https://radio-api.eplus.dev/v1/radio/resolve', station.id),
    'https://radio-api.eplus.dev/v1/radio/resolve?provider=apple-music&station_id=apple-music-1');
  for (const endpoint of ['', 'http://radio-api.eplus.dev/resolve', 'https://a.test/resolve?url=https://evil.test',
    'https://user:password@a.test/resolve', 'https://a.test/#fragment']) {
    assert.equal(buildAuthorizedResolverRequest(endpoint, station.id), null);
  }
  assert.equal(buildAuthorizedResolverRequest('https://a.test/resolve', '../other'), null);
});

test('valid signed Apple stream is matched against the selected Apple Music station and earliest expiry', () => {
  const result = validateAuthorizedAppleStream(valid, station.id, station.listen_url, now);
  assert.equal(result.ok, true);
  assert.equal(result.streamUrl, appleStream);
  assert.equal(result.expiresAt, expires * 1000);
});

test('rejects unauthorized, mismatched, expired, malformed or non-Apple stream responses', () => {
  const rejected = [
    { ...valid, authorized: false }, { ...valid, station_id: 'apple-music-hits' },
    { ...valid, provider: 'tunein' }, { ...valid, stream_url: 'https://evil.test/file.m3u8?accessKey=x' },
    { ...valid, stream_url: 'http://itsliveradio.apple.com/3p-tune-in/tune_in/978194965/usw/256.m3u8?accessKey=x' },
    { ...valid, stream_url: appleStream.replace('978194965/usw', '99999999/usw') },
    { ...valid, stream_url: appleStream.replace('accessKey=', 'anyKey=') },
    { ...valid, expires_at: 5 }, { ...valid, expires_at: 'invalid' },
  ];
  for (const payload of rejected) {
    assert.equal(validateAuthorizedAppleStream(payload, station.id, station.listen_url, now).ok, false);
  }
});

test('resolver never forwards third-party credentials and never caches signed URLs', async () => {
  let called = false;
  const signal = new AbortController().signal;
  const response = await resolveAuthorizedAppleStream({
    endpoint: 'https://radio-api.eplus.dev/v1/radio/resolve', station, signal,
    fetcher: async (url, opts) => {
      called = true;
      assert.match(url, /station_id=apple-music-1/);
      assert.doesNotMatch(url, /accessKey|itemToken|Tune\.ashx/);
      assert.equal(opts.credentials, 'omit');
      assert.equal(opts.cache, 'no-store');
      assert.equal(opts.signal, signal);
      return { ok: true, json: async () => ({ ...valid, expires_at: Math.floor(Date.now() / 1000) + 600,
        stream_url: `https://itsliveradio.apple.com/3p-tune-in/tune_in/978194965/usw/256.m3u8?accessKey=${Math.floor(Date.now() / 1000)+600}_opaque_signature` }) };
    },
  });
  assert.equal(called, true);
  assert.equal(response.ok, true);
});

test('creates an ephemeral station for the existing single global player', () => {
  const entry = createAuthorizedApplePlaybackStation(station, appleStream);
  assert.equal(entry.url, '/global-radio/apple-music/apple-music-1');
  assert.equal(entry.sources.length, 1);
  assert.equal(entry.sources[0].src, appleStream);
  assert.equal(entry.sources[0].type, 'application/vnd.apple.mpegurl');
  assert.equal(entry.schedule, '');
});

test('provider pages offer in-app playback only behind configured authorized resolver', async () => {
  for (const path of ['pages/global-radio/apple-music/index.vue', 'pages/global-radio/apple-music/[station].vue']) {
    const source = await readFile(new URL('../' + path, import.meta.url), 'utf8');
    assert.match(source, /v-if="canListenOnEplus/);
    assert.match(source, /@click="playOnEplus\(station\)"/);
    assert.match(source, /useAuthorizedGlobalRadioPlayback/);
    assert.match(source, /listen_on_apple/);
    assert.match(source, /listen_on_tunein/);
    assert.doesNotMatch(source, /GlobalRadioTemporaryHlsPreview|\.m3u8|accessKey|<audio\b/);
  }
});

test('only the ePlus-controlled resolver can enable the in-app CTA', async () => {
  const config = await readFile(new URL('../nuxt.config.ts', import.meta.url), 'utf8');
  const env = await readFile(new URL('../.env.example', import.meta.url), 'utf8');
  assert.match(config, /NUXT_PUBLIC_GLOBAL_RADIO_RESOLVER_URL/);
  assert.match(env, /NUXT_PUBLIC_GLOBAL_RADIO_RESOLVER_URL=/);
  assert.doesNotMatch(env, /NUXT_PUBLIC_GLOBAL_RADIO_RESOLVER_URL=https:\/\//);
});
