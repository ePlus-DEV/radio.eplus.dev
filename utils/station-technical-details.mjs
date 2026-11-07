// Display-only stream hints from the published station catalog.
// A URL extension or declared MIME/bitrate is NOT proof of an available,
// playable stream, of its negotiated codec, or of measured bandwidth.
const BY_EXTENSION = new Map([
  ['.m3u8', 'HLS'],
  ['.mp3', 'MP3'],
  ['.aac', 'AAC'],
  ['.aacp', 'AAC'],
  ['.ogg', 'Ogg'],
  ['.oga', 'Ogg'],
  ['.opus', 'Opus'],
  ['.flac', 'FLAC'],
  ['.m4a', 'M4A'],
]);
const BY_MIME = new Map([
  ['application/vnd.apple.mpegurl', 'HLS'],
  ['application/x-mpegurl', 'HLS'],
  ['audio/x-mpegurl', 'HLS'],
  ['audio/mpeg', 'MP3'],
  ['audio/mp3', 'MP3'],
  ['audio/aac', 'AAC'],
  ['audio/aacp', 'AAC'],
  ['audio/ogg', 'Ogg'],
  ['audio/opus', 'Opus'],
  ['audio/flac', 'FLAC'],
  ['audio/mp4', 'M4A'],
]);
const CODECS = new Map([
  ['mp3', 'MP3'],
  ['aac', 'AAC'],
  ['he-aac', 'HE-AAC'],
  ['aac+', 'HE-AAC'],
  ['flac', 'FLAC'],
  ['opus', 'Opus'],
  ['vorbis', 'Vorbis'],
]);

function extensionFormat(url) {
  if (typeof url !== 'string') return '';
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    const path = parsed.pathname.toLowerCase();
    for (const [ext, format] of BY_EXTENSION) {
      if (path.endsWith(ext)) return format;
    }
  } catch {
    // Relative and malformed paths provide no format evidence.
  }
  return '';
}

export function stationTechnicalDetails(meta) {
  if (!meta || typeof meta !== 'object') {
    return { format: '', formatEvidence: '', codec: '', bitrateKbps: null, hasDetails: false };
  }

  // Prefer the actual primary stream URL suffix over a generic MIME claim;
  // existing catalog entries may report audio/mpeg for AAC stream URLs.
  const inferred = extensionFormat(meta.stream);
  const declared = typeof meta.type === 'string'
    ? BY_MIME.get(meta.type.trim().toLowerCase().split(';')[0]) || ''
    : '';
  const format = inferred || declared;
  const formatEvidence = inferred ? 'url' : declared ? 'catalog' : '';
  const codec = typeof meta.codec === 'string'
    ? CODECS.get(meta.codec.trim().toLowerCase()) || ''
    : '';
  // Bitrate is explicitly declared catalog metadata, never derived from
  // playlist filenames, browser events or network requests.
  const kbps = typeof meta.bitrate === 'number' ? meta.bitrate : null;
  const bitrateKbps = Number.isInteger(kbps) && kbps >= 8 && kbps <= 1024 ? kbps : null;

  return {
    format, formatEvidence, codec, bitrateKbps,
    hasDetails: Boolean(format || codec || bitrateKbps !== null),
  };
}
