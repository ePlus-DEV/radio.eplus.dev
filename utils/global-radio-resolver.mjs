// The browser only consumes an approved ePlus-controlled resolver. This module
// deliberately does NOT call TuneIn, extract keys or impersonate a provider.
export const APPLE_HLS_HOST = 'itsliveradio.apple.com';
export const MIN_STREAM_TTL_MS = 45_000;

const stationSlug = value => typeof value === 'string' && /^[a-z0-9-]{3,80}$/.test(value);
const httpsUrl = value => {
  try {
    const url = new URL(String(value || ''));
    if (url.protocol !== 'https:' || url.username || url.password || url.hash) return null;
    return url;
  } catch { return null; }
};

export function buildAuthorizedResolverRequest(endpoint, stationId) {
  const url = httpsUrl(endpoint);
  if (!url || !stationSlug(stationId) || url.search || url.hash) return null;
  url.searchParams.set('provider', 'apple-music');
  url.searchParams.set('station_id', stationId);
  return url.href;
}

export function validateAuthorizedAppleStream(payload, stationId, appleListenUrl, now = Date.now()) {
  if (!stationSlug(stationId) || !payload || typeof payload !== 'object'
    || payload.status !== 'ok' || payload.authorized !== true
    || payload.provider !== 'apple-music' || payload.station_id !== stationId) {
    return { ok: false, reason: 'unauthorized' };
  }
  const stationPage = httpsUrl(appleListenUrl);
  const stationNumber = stationPage?.hostname === 'music.apple.com'
    ? stationPage.pathname.match(/\/ra\.(\d+)$/)?.[1]
    : null;
  const stream = httpsUrl(payload.stream_url);
  // Apple/TuneIn serves more than one legitimate playlist layout.
  // HAR for Holiday Hits confirms /ppa/index-cmaf.m3u8; other station samples
  // include the Apple radio ID in the path. Keep variants tightly allowlisted.
  const matchesNumberedPath = stationNumber && new RegExp(
    '^/3p-tune-in/tune_in/' + stationNumber + '/[a-z0-9_-]+/\\d+\\.m3u8
  // The signed token is never persisted or logged. Verify the server expiry,
  // and never trust it if the accessKey embeds an earlier Unix expiration.
  const expiresSeconds = Number(payload.expires_at);
  if (!Number.isSafeInteger(expiresSeconds)) return { ok: false, reason: 'invalid_expiry' };
  let expiresAt = expiresSeconds * 1000;
  const tokenEpoch = stream.searchParams.get('accessKey').split('_', 1)[0];
  if (/^\d{10}$/.test(tokenEpoch)) expiresAt = Math.min(expiresAt, Number(tokenEpoch) * 1000);
  if (expiresAt < now + MIN_STREAM_TTL_MS) return { ok: false, reason: 'expired' };
  return { ok: true, streamUrl: stream.href, expiresAt };
}

export async function resolveAuthorizedAppleStream({ endpoint, station, signal, fetcher = fetch }) {
  const requestUrl = buildAuthorizedResolverRequest(endpoint, station?.id);
  if (!requestUrl) throw new Error('not_configured');
  // No credentials, no access keys in request, and never cache signed URLs.
  const response = await fetcher(requestUrl, {
    method: 'GET',
    cache: 'no-store',
    credentials: 'omit',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) throw new Error('unavailable');
  const payload = await response.json();
  const checked = validateAuthorizedAppleStream(payload, station.id, station.listen_url);
  if (!checked.ok) throw new Error(checked.reason);
  return checked;
}
, 'i',
  ).test(stream?.pathname || '');
  const matchesHolidayPath = stationId === 'apple-music-holiday-hits'
    && stream?.pathname === '/3p-tune-in/tune_in/ppa/index-cmaf.m3u8';
  if (!stationNumber || !stream || stream.hostname !== APPLE_HLS_HOST
    || !(matchesNumberedPath || matchesHolidayPath)
    || !stream.searchParams.get('accessKey')) {
    return { ok: false, reason: 'invalid_source' };
  }
  // The signed token is never persisted or logged. Verify the server expiry,
  // and never trust it if the accessKey embeds an earlier Unix expiration.
  const expiresSeconds = Number(payload.expires_at);
  if (!Number.isSafeInteger(expiresSeconds)) return { ok: false, reason: 'invalid_expiry' };
  let expiresAt = expiresSeconds * 1000;
  const tokenEpoch = stream.searchParams.get('accessKey').split('_', 1)[0];
  if (/^\d{10}$/.test(tokenEpoch)) expiresAt = Math.min(expiresAt, Number(tokenEpoch) * 1000);
  if (expiresAt < now + MIN_STREAM_TTL_MS) return { ok: false, reason: 'expired' };
  return { ok: true, streamUrl: stream.href, expiresAt };
}

export async function resolveAuthorizedAppleStream({ endpoint, station, signal, fetcher = fetch }) {
  const requestUrl = buildAuthorizedResolverRequest(endpoint, station?.id);
  if (!requestUrl) throw new Error('not_configured');
  // No credentials, no access keys in request, and never cache signed URLs.
  const response = await fetcher(requestUrl, {
    method: 'GET',
    cache: 'no-store',
    credentials: 'omit',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) throw new Error('unavailable');
  const payload = await response.json();
  const checked = validateAuthorizedAppleStream(payload, station.id, station.listen_url);
  if (!checked.ok) throw new Error(checked.reason);
  return checked;
}
