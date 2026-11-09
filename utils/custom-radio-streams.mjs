// Browser-local personal radio URLs. Do not send to a server, CORS proxy,
// public catalog, sitemap, analytics, logs, or issue reports.
export const CUSTOM_STREAMS_STORAGE_KEY = 'radio:custom-streams:v1';
export const MAX_CUSTOM_STREAMS = 40;
const MAX_URL_LENGTH = 2048;
const MAX_TITLE_LENGTH = 96;
const MAX_STORAGE_LENGTH = 100_000;
const SECRET_KEY = /^(?:token|access[_-]?token|access[_-]?key|api[_-]?key|key|secret|password|passwd|pass|pwd|auth|authorization|jwt|session|signature|sig|hmac|credential|client[_-]?secret|expires|expiry|exp)(?:$|[_-])/i;
const LOCAL_SUFFIXES = ['.localhost', '.local', '.lan', '.internal', '.home.arpa', '.onion', '.intranet', '.corp'];
const BAD_EXTENSIONS = /\.(?:html?|xhtml|js|mjs|css|svg|json|xml|pdf|zip|rar|7z|exe|dll|sh|bat|ps1)$/i;

function safeHostname(value) {
  const host = value.toLowerCase().replace(/\.$/, '');
  if (!host || !host.includes('.') || host.includes(':') || host.startsWith('[')) return false;
  if (LOCAL_SUFFIXES.some(suffix => host === suffix.slice(1) || host.endsWith(suffix))) return false;
  // Reject all IP literals, including alternative integer/octal/hex forms
  // canonicalized to dotted IPv4 by the WHATWG URL parser.
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return false;
  if (!/^[a-z0-9.-]+$/.test(host)) return false;
  return host.split('.').every(label => label && !label.startsWith('-') && !label.endsWith('-'));
}

function formatHint(pathname) {
  if (/\.m3u8$/i.test(pathname)) return 'hls';
  if (/\.mp3$/i.test(pathname)) return 'mp3';
  if (/\.(?:aac|aacp)$/i.test(pathname)) return 'aac';
  if (/\.(?:ogg|oga)$/i.test(pathname)) return 'ogg';
  if (/\.opus$/i.test(pathname)) return 'opus';
  if (/\.flac$/i.test(pathname)) return 'flac';
  if (/\.(?:m3u|pls)$/i.test(pathname)) return 'playlist';
  return 'unknown';
}

export function validateCustomStream(input) {
  const title = typeof input?.title === 'string' ? input.title.trim() : '';
  if (!title || title.length > MAX_TITLE_LENGTH || /[\u0000-\u001f\u007f<>]/u.test(title)) {
    return { ok: false, reason: 'invalid_title' };
  }
  const raw = typeof input?.url === 'string' ? input.url.trim() : '';
  if (!raw || raw.length > MAX_URL_LENGTH || /[\s\\<>]/u.test(raw)) {
    return { ok: false, reason: 'invalid_url' };
  }

  let parsed;
  try { parsed = new URL(raw); } catch { return { ok: false, reason: 'invalid_url' }; }
  if (!['https:', 'http:'].includes(parsed.protocol)) return { ok: false, reason: 'invalid_protocol' };
  if (parsed.username || parsed.password || parsed.hash || !safeHostname(parsed.hostname)) {
    return { ok: false, reason: 'unsafe_url' };
  }
  for (const key of parsed.searchParams.keys()) {
    if (SECRET_KEY.test(key)) return { ok: false, reason: 'credential_url' };
  }
  if (BAD_EXTENSIONS.test(parsed.pathname)) return { ok: false, reason: 'unsupported_format' };

  return {
    ok: true,
    stream: { title, url: parsed.href, format: formatHint(parsed.pathname) },
    // Inference never implies active status, real codec or verified bitrate.
    warning: parsed.protocol === 'http:' ? 'mixed_content_possible' : 'not_verified',
  };
}

export function normalizeCustomStreams(records) {
  const result = [];
  const seen = new Set();
  for (const item of Array.isArray(records) ? records : []) {
    const parsed = validateCustomStream(item);
    if (!parsed.ok || seen.has(parsed.stream.url)) continue;
    seen.add(parsed.stream.url);
    result.push(parsed.stream);
    if (result.length === MAX_CUSTOM_STREAMS) break;
  }
  return result;
}

export function parseCustomStreams(raw) {
  if (typeof raw !== 'string' || raw.length > MAX_STORAGE_LENGTH) return [];
  try {
    const data = JSON.parse(raw);
    return data?.version === 1 && Array.isArray(data.streams)
      ? normalizeCustomStreams(data.streams) : [];
  } catch {
    return [];
  }
}

export function serializeCustomStreams(records) {
  return JSON.stringify({ version: 1, streams: normalizeCustomStreams(records) });
}

export function addCustomStream(records, input) {
  const list = normalizeCustomStreams(records);
  const parsed = validateCustomStream(input);
  if (!parsed.ok) return parsed;
  if (list.some(item => item.url === parsed.stream.url)) return {ok:false, reason:'duplicate'};
  if (list.length >= MAX_CUSTOM_STREAMS) return {ok:false, reason:'limit'};
  return {ok:true, streams:[...list,parsed.stream], warning:parsed.warning};
}

export function editCustomStream(records, previousUrl, input) {
  const list = normalizeCustomStreams(records);
  const index = list.findIndex(item => item.url === previousUrl);
  if (index === -1) return {ok:false, reason:'not_found'};
  const parsed = validateCustomStream(input);
  if (!parsed.ok) return parsed;
  if (list.some((item, i) => i !== index && item.url === parsed.stream.url)) {
    return {ok:false, reason:'duplicate'};
  }
  const updated = [...list];
  updated[index] = parsed.stream;
  return {ok:true, streams:updated, warning:parsed.warning};
}

export function removeCustomStream(records, url) {
  // The UI must ask for explicit delete confirmation before invoking this.
  return normalizeCustomStreams(records).filter(item => item.url !== url);
}

/** A deliberately non-routable ID: never expose the private stream URL in a link. */
export function customStreamIdentity(rawUrl) {
  let hash = 2166136261;
  for (let i = 0; i < rawUrl.length; i += 1)
    hash = Math.imul(hash ^ rawUrl.charCodeAt(i), 16777619);
  return 'local-custom:' + (hash >>> 0).toString(16).padStart(8, '0');
}

export function isCustomStreamStation(station) {
  return station?.area === 'custom' && typeof station.url === 'string'
    && station.url.startsWith('local-custom:');
}

/** No new audio element, proxy, public route or persisted listening record. */
export function createCustomPlaybackStation(input) {
  const result = validateCustomStream(input);
  // A playlist may redirect to an unvalidated private-network URL. Reject it.
  if (!result.ok || result.stream.format === 'playlist') return null;
  const stream = result.stream;
  const mime = {
    hls: 'application/vnd.apple.mpegurl',
    mp3: 'audio/mpeg', aac: 'audio/aac',
    ogg: 'audio/ogg', opus: 'audio/ogg', flac: 'audio/flac',
  }[stream.format] || 'audio/mpeg';
  const id = customStreamIdentity(stream.url);
  return {
    id, url: id, area: 'custom', country: '',
    countryKey: 'custom_streams.title', title: stream.title,
    image: '/brand/onair-mark.svg', schedule: '',
    sources: [{ src: stream.url, type: mime, source: 'primary', proxied: false }],
  };
}
