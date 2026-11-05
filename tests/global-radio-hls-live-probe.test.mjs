// Read-only, branch-scoped diagnostic of HLS timed metadata; NOT a player
// implementation. Uses the EXISTING provider resolver; never logs stream
// URLs, signed access keys, playlist contents, audio bytes, or metadata values.
// No saved recordings, no playlist rebroadcast, no credentials.
import test from 'node:test';
import { resolvePublicTuneInStream } from '../utils/global-radio-public-tunein.mjs';

const enabled = process.env.GITHUB_ACTIONS === 'true'
  && process.env.GITHUB_HEAD_REF === 'feat/tunein-apple-radio-song-history-20261105';
const stationIds = ['apple-music-1', 'apple-music-hits', 'apple-music-chill'];
const MAX_PLAYLIST = 180_000;
const MAX_SEGMENT = 196_608;

function isApproved(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:'
      && parsed.hostname === 'itsliveradio.apple.com'
      && parsed.pathname.startsWith('/3p-tune-in/tune_in/')
      && !parsed.username && !parsed.password;
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
  const text = new TextDecoder('latin1').decode(bytes);
  // Presence-only heuristics; no track claims without actual ID3 parsing.
  return {
    prefixBytes: bytes.byteLength,
    id3SyncPresent: text.includes('ID3'),
    id3TitleFramePresent: text.includes('TIT2'),
    id3ArtistFramePresent: text.includes('TPE1'),
    id3PrivateFramePresent: text.includes('PRIV'),
    transportStreamSyncByte: bytes[0] === 0x47,
  };
}

test('diagnostic only: inspect authorized HLS manifests for timed-song metadata (no audio logged)', {
  skip: !enabled,
  timeout: 90_000,
}, async () => {
  for (const stationId of stationIds) {
    const report = { stationId, resolved: false, master: null, media: null, segment: null, error: null };
    try {
      const station = { id: stationId };
      const resolved = await resolvePublicTuneInStream({ station });
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
