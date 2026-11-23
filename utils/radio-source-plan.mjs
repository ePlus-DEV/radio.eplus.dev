export const MAX_STREAM_ATTEMPTS = 6;

const normalizeProxyBase = (value) => {
  const base = String(value || "").trim();
  if (!base) return "";
  // Ignore malformed or credential-bearing proxy settings rather than creating
  // an unusable playback candidate (or exposing credentials in its URL).
  try {
    const url = new URL(base);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || base.includes("?") || base.includes("#")) return "";
    return base.endsWith("/") ? base : `${base}/`;
  } catch { return ""; }
};

export const buildPlaybackSources = (sources, corsServer) => {
  const proxyBase = normalizeProxyBase(corsServer);
  const result = [];
  const seen = new Set();

  const push = (source) => {
    const src = String(source?.src || "").trim();
    if (!src || seen.has(src)) return;
    seen.add(src);
    result.push({ ...source, src });
  };

  for (const source of Array.isArray(sources) ? sources : []) {
    const src = String(source?.src || "").trim();
    if (!src) continue;

    push(source);

    const type = String(source?.type || "").toLowerCase();
    // Query/fragment values can mention backup HLS URLs without making this source HLS.
    const path = src.split(/[?#]/, 1)[0];
    const isHls =
      /\.m3u8$/i.test(path) ||
      type.includes("mpegurl") ||
      type.includes("m3u8");

    // Never forward URL-embedded credentials to a third-party CORS proxy.
    // Preserve the direct candidate; only suppress its proxy fallback.
    let hasCredentials = false;
    let alreadyProxied = false;
    try {
      const parsed = new URL(src);
      // Signed stream URLs (including AWS/GCS provider-specific query fields) must not reach third-party proxies.
      const sensitiveQuery = [...parsed.searchParams.keys()].some(key =>
        /^(?:x-amz-.+|x-goog-.+|awsaccesskeyid|googleaccessid|token|(?:access|refresh|id|auth|session)[_-]?token|access[_-]?key|api[_-]?key|client[_-]?secret|session[_-]?key|auth(?:orization)?|signature|sig|secret|password|jwt|expires?|policy|key[_-]?pair[_-]?id)$/i.test(key));
      hasCredentials = Boolean(parsed.username || parsed.password || sensitiveQuery);
      // URL canonicalization normalizes host casing and default ports, unlike a raw string prefix check.
      alreadyProxied = Boolean(proxyBase) && parsed.href.startsWith(new URL(proxyBase).href);
    } catch { /* Invalid URLs are not eligible for proxy fallback. */
      hasCredentials = true;
    }

    const canProxy =
      proxyBase &&
      !hasCredentials &&
      !isHls &&
      !source.proxied &&
      /^https?:\/\//i.test(src) &&
      !alreadyProxied;

    if (canProxy) {
      push({
        ...source,
        src: `${proxyBase}${src}`,
        proxied: true,
      });
    }
  }

  return result;
};

export const nextPlaybackIndex = (currentIndex, count) => {
  if (!Number.isInteger(count) || count <= 0) return -1;
  // Invalid or stale indexes must never produce NaN or an out-of-range slot.
  if (!Number.isInteger(currentIndex) || currentIndex < 0 || currentIndex >= count) return 0;
  return (currentIndex + 1) % count;
};
