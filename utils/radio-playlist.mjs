// Pure radio playlist helpers shared by the global player. Keep transport
// orchestration and timeouts inside the single audio session.
export const inferMime = (url, fallback = 'audio/mpeg') => {
  const value = url.toLowerCase();
  if (/\.m3u8(?:$|[?#])/i.test(value)) return 'application/vnd.apple.mpegurl';
  if (/\.aac(?:$|[?#])/i.test(value)) return 'audio/aac';
  if (/\.ogg(?:$|[?#])/i.test(value)) return 'audio/ogg';
  if (/\.opus(?:$|[?#])/i.test(value)) return 'audio/opus';
  if (/\.mp3(?:$|[?#])/i.test(value)) return 'audio/mpeg';
  return fallback || 'audio/mpeg';
};

export const isTextPlaylist = (url) =>
  /\.pls(?:$|[?#])/i.test(url) ||
  /(?:[?&](?:output|format)=pls(?:&|$))/i.test(url) ||
  /\.m3u(?:$|[?#])/i.test(url);

export const parsePlaylistUrls = (text) => {
  const urls = new Set();

  for (const line of text.split(/\r?\n/)) {
    const value = line.trim();
    if (!value || value.startsWith('#')) continue;

    const plsMatch = value.match(/^File\d+\s*=\s*(https?:\/\/.+)$/i);
    const candidate = plsMatch?.[1]?.trim() || value;

    if (/^https?:\/\//i.test(candidate)) {
      urls.add(candidate);
    }
  }

  return [...urls];
};

/**
 * Resolve legacy PLS/M3U playlists using a bounded request. This does not
 * parse HLS manifests or create a second audio player. Failure returns the
 * original source so the global Player owns retries and fallback ordering.
 */
export async function resolvePlaylistSource(source, {
  fetchFn = fetch,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
  timeoutMs = 5_000,
} = {}) {
  if (!source || !isTextPlaylist(source.src)) return source;
  const controller = new AbortController();
  const timer = setTimeoutFn(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchFn(source.src, {
      signal: controller.signal,
      headers: { accept: 'audio/x-scpls,audio/x-mpegurl,text/plain,*/*' },
    });
    if (!response.ok) return source;
    const first = parsePlaylistUrls(await response.text())[0];
    return first ? { src: first, type: inferMime(first, source.type) } : source;
  } catch {
    return source;
  } finally {
    clearTimeoutFn(timer);
  }
}
