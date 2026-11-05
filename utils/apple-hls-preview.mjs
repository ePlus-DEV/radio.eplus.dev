const APPLE_HLS_HOST = 'itsliveradio.apple.com';
const SIGNED_PLAYLIST_PATH = /^\/3p-tune-in\/tune_in\/(\d{6,13})\/[a-z0-9-]+\/(\d{2,4})\.m3u8$/i;

/**
 * Validate a short-lived, user-supplied Apple/TuneIn HLS URL without
 * making a network request or returning the accessKey in diagnostic data.
 *
 * This is a local preview guard, not a token generator/refresher or proof
 * of authorization, service availability, browser support or CORS.
 */
export function inspectAppleHlsPreviewUrl(value, stationPageUrl, now = Date.now()) {
  const fail = (reason) => ({ ok: false, reason });
  const raw = String(value ?? '').trim();
  if (!raw || raw.length > 8192 || /\s/.test(raw)) return fail('invalid');
  let url;
  try {
    url = new URL(raw);
  } catch {
    return fail('invalid');
  }
  if (url.protocol !== 'https:' || url.hostname !== APPLE_HLS_HOST ||
      url.username || url.password || url.port || url.hash) return fail('invalid');
  const match = url.pathname.match(SIGNED_PLAYLIST_PATH);
  if (!match) return fail('invalid');
  const expectedStationId = String(stationPageUrl ?? '').match(/\/ra\.(\d+)(?:[?#]|$)/)?.[1];
  if (!expectedStationId || match[1] !== expectedStationId) return fail('station_mismatch');
  if (url.searchParams.size !== 1 || url.searchParams.getAll('accessKey').length !== 1) return fail('invalid');
  const accessKey = url.searchParams.get('accessKey') || '';
  // Timestamp prefix is empirically observed, not a published Apple contract.
  const token = accessKey.match(/^(\d{10})_[0-9a-f]{32}_[A-Za-z0-9+/=]+$/i);
  if (!token) return fail('invalid');
  const expiresAt = Number(token[1]) * 1000;
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now + 30_000) {
    return { ...fail('expired'), expiresAt: Number.isSafeInteger(expiresAt) ? expiresAt : null };
  }
  return { ok: true, reason: 'ready', expiresAt, stationId: match[1], qualityLabel: match[2] };
}

export function appleHlsPreviewExpiry(url, now = Date.now()) {
  try {
    const token = new URL(url).searchParams.get('accessKey')?.match(/^(\d{10})_/);
    if (!token) return true;
    return Number(token[1]) * 1000 <= now + 30_000;
  } catch {
    return true;
  }
}
