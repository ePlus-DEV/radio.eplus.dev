// Read-only, branch-scoped diagnostic of HLS timed metadata; NOT a player
// implementation. Uses the EXISTING provider resolver; never logs stream
// URLs, signed access keys, playlist contents, audio bytes, or metadata values.
// No saved recordings, no playlist rebroadcast, no credentials.
import test from 'node:test';
import { resolvePublicTuneInStream } from '../utils/global-radio-public-tunein.mjs';
import { parseHlsId3Tag } from '../utils/hls-song-metadata.mjs';

const corsServer = process.env.NUXT_PUBLIC_CORS_SERVER_1 || '';
const enabled = process.env.GITHUB_ACTIONS === 'true'
  && process.env.GITHUB_HEAD_REF === 'feat/tunein-apple-radio-song-history-20261105'
  && Boolean(corsServer);
const stationIds = ['apple-music-1', 'apple-music-hits', 'apple-music-chill'];
const MAX_PLAYLIST = 180_000;
const MAX_SEGMENT = 196_608;

function isApproved(url) {
  try {
    const parsed = new URL(url);
    const masterOrVariant = parsed.pathname.startsWith('/3p-tune-in/tune_in/');
    // Verified in the user's HAR: CMAF audio fragments use a different
    // Apple-owned path from the TuneIn manifests. Do not reject them.
    const cmafFragment = /^\\/3p-tune-in\\/bb\\/as_live_aod\\/\\d+\\/[a-z0-9-]+\\/cmaf\\/\\d+_\\d+\\/fileSequence\\d+\\.(?:m4s|mp4)$/i
      .test(parsed.pathname);
    return parsed.protocol === 'https:'
      && parsed.hostname === 'itsliveradio.apple.com'
      && (masterOrVariant || cmafFragment)
      && !parsed.username && !parsed.password && !parsed.port
      && [...parsed.searchParams].every(([key]) => key === 'accessKey');
  } catch { return false; }
}

async function getText(url, timeoutMs = 7_000) {
  if (!isApproved(url)) throw Error('unapproved_origin');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'GET', credentials: 'omit', cache: 'no-store',
      redirect: 'error', signal: controller.signal,
    });
    if (!response.ok) throw Error('http_' + response.status);
    const length = Number(response.headers.get('content-length') || '0');
    if (length > MAX_PLAYLIST) throw Error('oversized_playlist');
    const text = await response.text();
    if (text.length > MAX_PLAYLIST || !text.startsWith('#EXTM3U')) throw Error('not_m3u8');
    return text;
  } finally { clearTimeout(timer); }
}

function nextPlaylistUrl(playlist, baseUrl) {
  const lines = playlist.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  for (let i = 0; i < lines.length - 1; i++) {
    if (!lines[i].startsWith('#EXT-X-STREAM-INF:')) continue;
    const next = lines[i + 1];
    if (!next.startsWith('#')) {
      const url = new URL(next, baseUrl).href;
      return isApproved(url) ? url : null;
    }
  }
  return null;
}

function mediaSegmentUrl(playlist, baseUrl) {
  // HLS segment URIs need not end in .ts/.aac; look for the URI immediately
  // after EXTINF instead of guessing the file extension.
  const lines = playlist.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const entries = [];
  for (let i = 0; i < lines.length - 1; i++) {
    if (!lines[i].startsWith('#EXTINF:') || lines[i + 1].startsWith('#')) continue;
    entries.push(lines[i + 1]);
  }
  for (const entry of entries.slice(-3).reverse()) {
    const url = new URL(entry, baseUrl).href;
    if (isApproved(url)) return url;
  }
  return null;
}

async function getSegmentPrefix(url) {
  if (!isApproved(url)) throw Error('unapproved_origin');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7_000);
  try {
    const response = await fetch(url, {
      method: 'GET', credentials: 'omit', cache: 'no-store',
      redirect: 'error', headers: { Range: 'bytes=0-' + (MAX_SEGMENT - 1) },
      signal: controller.signal,
    });
    if (!response.ok) throw Error('http_' + response.status);
    const chunks = [];
    let size = 0;
    const reader = response.body?.getReader();
    if (!reader) throw Error('no_stream');
    while (size < MAX_SEGMENT) {
      const { value, done } = await reader.read();
      if (done) break;
      const part = value.subarray(0, MAX_SEGMENT - size);
      chunks.push(part);
      size += part.length;
    }
    await reader.cancel().catch(() => {});
    const result = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
    return result;
  } finally { clearTimeout(timer); }
}

function summarizePlaylist(text) {
  return {
    daterange: /#EXT-X-DATERANGE:/i.test(text),
    programDateTime: /#EXT-X-PROGRAM-DATE-TIME:/i.test(text),
    obviousSongFields: /#EXT-X-DATERANGE:[^\n]*(?:SONG|ARTIST|TITLE)=/i.test(text),
    streamInfo: /#EXT-X-STREAM-INF:/i.test(text),
    segmentCount: text.split(/\r?\n/).filter(x => /^#EXTINF:/.test(x)).length,
  };
}

function summarizeSegment(bytes) {
  // Inspect only the bounded top-level CMAF emsg boxes, never audio frames.
  // We do not print metadata strings, private frames, signed URLs or audio.
  let cursor = 0;
  let emsgTags = 0;
  let songTags = 0;
  let otherTags = 0;
  while (cursor + 8 <= bytes.byteLength) {
    const size = new DataView(bytes.buffer, bytes.byteOffset + cursor, 4).getUint32(0);
    if (size < 8 || cursor + size > bytes.byteLength) break;
    const kind = String.fromCharCode(...bytes.subarray(cursor + 4, cursor + 8));
    if (kind === 'emsg' && bytes[cursor + 8] === 1) {
      const scheme = new TextEncoder().encode('https://aomedia.org/emsg/ID3');
      const offset = cursor + 32;
      const schemeEnd = offset + scheme.byteLength;
      if (schemeEnd + 2 < cursor + size &&
        scheme.every((value, i) => bytes[offset + i] === value) &&
        bytes[schemeEnd] === 0) {
        let valueEnd = schemeEnd + 1;
        while (valueEnd < cursor + size && bytes[valueEnd] !== 0) valueEnd++;
        const id3Start = valueEnd + 1;
        if (id3Start + 10 <= cursor + size && bytes[id3Start] === 0x49
          && bytes[id3Start + 1] === 0x44 && bytes[id3Start + 2] === 0x33) {
          emsgTags++;
          const tag = bytes.subarray(id3Start, cursor + size);
          if (parseHlsId3Tag(tag, { appleMusic: true })) songTags++;
          else otherTags++;
        }
      }
    }
    cursor += size;
  }
  return { prefixBytes: bytes.byteLength, emsgTags, songTags, otherTags };
}

test('diagnostic only: inspect authorized HLS manifests for timed-song metadata (no audio logged)', {
  skip: !enabled,
  timeout: 90_000,
}, async () => {
  for (const stationId of stationIds) {
    const report = { stationId, resolved: false, master: null, media: null, segment: null, error: null };
    try {
      const station = { id: stationId };
      const resolved = await resolvePublicTuneInStream({ station, corsServer });
      report.resolved = Boolean(resolved.ok);
      if (!isApproved(resolved.streamUrl)) throw Error('unapproved_origin');
      const master = await getText(resolved.streamUrl);
      report.master = summarizePlaylist(master);
      const mediaUrl = nextPlaylistUrl(master, resolved.streamUrl);
      if (mediaUrl) {
        const media = await getText(mediaUrl);
        report.media = summarizePlaylist(media);
        const segmentUrl = mediaSegmentUrl(media, mediaUrl);
        if (segmentUrl) report.segment = summarizeSegment(await getSegmentPrefix(segmentUrl));
      } else {
        const segmentUrl = mediaSegmentUrl(master, resolved.streamUrl);
        if (segmentUrl) report.segment = summarizeSegment(await getSegmentPrefix(segmentUrl));
      }
    } catch (error) {
      // Error names/status only: no provider URLs or error messages.
      const message = String(error?.message || '');
      report.error = /^http_\d{3}$/.test(message) ? message
        : message === 'unapproved_origin' ? 'unapproved_origin'
        : error?.name === 'AbortError' ? 'timeout'
        : 'unavailable_or_unexpected_format';
    }
    console.log('TUNEIN_HLS_METADATA_PROBE', JSON.stringify(report));
  }
});
