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
