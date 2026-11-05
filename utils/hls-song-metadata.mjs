// Decode a genuine song + artist pair from timed HLS ID3 metadata.
// This module only parses bytes already received by the media player;
// it never fetches audio, downloads playlists or accesses HLS credentials.
// Missing/incomplete tags return no track (never infer from station/show names).
const MAX_TAG_BYTES = 65_536;
const MAX_TEXT_BYTES = 4_096;
const MAX_SCHEDULED = 32;
const CHECK_AHEAD_SECONDS = 0.5;

const synchsafe = (bytes, index) => {
  if (index + 4 > bytes.length) return -1;
  for (let i = 0; i < 4; i++) if (bytes[index + i] & 0x80) return -1;
  return ((bytes[index] << 21) | (bytes[index + 1] << 14)
    | (bytes[index + 2] << 7) | bytes[index + 3]) >>> 0;
};

function frameText(payload) {
  if (!(payload instanceof Uint8Array) || payload.length < 2
    || payload.length > MAX_TEXT_BYTES) return '';
  const encoding = payload[0];
  let bytes = payload.subarray(1);
  let decoder = 'windows-1252';
  if (encoding === 3) decoder = 'utf-8';
  else if (encoding === 2) decoder = 'utf-16be';
  else if (encoding === 1) {
    if (bytes[0] === 0xfe && bytes[1] === 0xff) {
      decoder = 'utf-16be';
      bytes = bytes.subarray(2);
    } else if (bytes[0] === 0xff && bytes[1] === 0xfe) {
      decoder = 'utf-16le';
      bytes = bytes.subarray(2);
    } else return '';
  } else if (encoding !== 0) return '';
  try {
    // ID3 text may be multi-value; the first non-empty value identifies the
    // main title/performer. Reject control chars, never parse arbitrary PRIV.
    const raw = new TextDecoder(decoder, { fatal: true }).decode(bytes);
    const text = raw.split('\u0000').find(s => s.trim()) || '';
    if (/[\u0001-\u001f\u007f]/.test(text)) return '';
    return text.trim().slice(0, 180);
  } catch { return ''; }
}

export function parseHlsId3Tag(data) {
  if (!(data instanceof Uint8Array) || data.length < 20
    || data.length > MAX_TAG_BYTES || data[0] !== 0x49
    || data[1] !== 0x44 || data[2] !== 0x33) return null;
  const version = data[3];
  if (version !== 3 && version !== 4) return null;
  if (data[5] & 0x40) return null; // Don't interpret unparsed extended headers.
  const tagSize = synchsafe(data, 6);
  if (tagSize < 10 || tagSize + 10 > data.length) return null;
  const end = 10 + tagSize;
  let index = 10;
  let title = '';
  let artist = '';
  while (index + 10 <= end) {
    const id = String.fromCharCode(...data.subarray(index, index + 4));
    if (!/^[A-Z0-9]{4}$/.test(id)) break;
    const size = version === 4 ? synchsafe(data, index + 4)
      : ((data[index + 4] << 24) >>> 0) + (data[index + 5] << 16)
        + (data[index + 6] << 8) + data[index + 7];
    if (size <= 0 || index + 10 + size > end) break;
    // Do not decode compressed, encrypted or grouped frames as plain text.
    if (!data[index + 8] && !data[index + 9] && size <= MAX_TEXT_BYTES) {
      if (id === 'TIT2') title = frameText(data.subarray(index + 10, index + 10 + size));
      if (id === 'TPE1') artist = frameText(data.subarray(index + 10, index + 10 + size));
    }
    index += 10 + size;
    if (title && artist) break;
  }
  return title && artist && title.toLocaleLowerCase() !== artist.toLocaleLowerCase()
    ? { title, artist } : null;
}

export function extractHlsId3Tracks(samples) {
  if (!Array.isArray(samples)) return [];
  const tracks = [];
  for (const sample of samples.slice(0, MAX_SCHEDULED)) {
    // Only accept an actual ID3 byte array, never string or untrusted JSON.
    const parsed = parseHlsId3Tag(sample?.data);
    if (!parsed) continue;
    tracks.push({ ...parsed,
      pts: typeof sample.pts === 'number' && Number.isFinite(sample.pts)
        ? sample.pts : null });
  }
  return tracks;
}

export function createTimedHlsTrackBuffer() {
  let pending = [];
  let lastTrack = null;
  return {
    add(samples) {
      const tracks = extractHlsId3Tracks(samples);
      pending.push(...tracks);
      if (pending.length > MAX_SCHEDULED) pending = pending.slice(-MAX_SCHEDULED);
      return tracks.length;
    },
    consume(mediaTime) {
      if (!Number.isFinite(mediaTime)) return null;
      let ready = null;
      const waiting = [];
      for (const entry of pending) {
        if (entry.pts === null || entry.pts <= mediaTime + CHECK_AHEAD_SECONDS) {
          if (!ready || (entry.pts ?? -1) >= (ready.pts ?? -1)) ready = entry;
        } else waiting.push(entry);
      }
      pending = waiting;
      if (!ready) return null;
      if (lastTrack?.title === ready.title && lastTrack?.artist === ready.artist) return null;
      lastTrack = ready;
      return { title: ready.title, artist: ready.artist };
    },
    clear() {
      pending = [];
      lastTrack = null;
    },
  };
}


// WebKit/native HLS exposes timed ID3 frames as metadata TextTrack cues.
// Only pair explicit TIT2 + TPE1 frames from concurrently active cues.
export function extractNativeHlsId3Track(cues) {
  if (!cues || typeof cues.length !== 'number') return null;
  let title = '';
  let artist = '';
  for (let i = 0; i < Math.min(cues.length, MAX_SCHEDULED); i++) {
    const cue = cues[i];
    const value = cue?.value;
    if (!value || typeof value !== 'object'
      || (value.key !== 'TIT2' && value.key !== 'TPE1')) continue;
    let text = '';
    if (typeof value.data === 'string') {
      const trimmed = value.data.trim();
      if (trimmed && trimmed.length <= 180
        && !/[\u0000-\u001f\u007f]/.test(trimmed)) text = trimmed;
    } else {
      const bytes = value.data instanceof Uint8Array ? value.data
        : value.data instanceof ArrayBuffer ? new Uint8Array(value.data) : null;
      if (bytes) text = frameText(bytes);
    }
    if (value.key === 'TIT2') title = text;
    else artist = text;
  }
  return title && artist && title.toLocaleLowerCase() !== artist.toLocaleLowerCase()
    ? { title, artist } : null;
}
