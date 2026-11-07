import { stationIdentity } from './listening-library.mjs';

export function stationShareUrl(path) {
  if (!stationIdentity({ url: path, title: 'station' })) return '';
  // Share the public station page, never the current route, stream or autoplay intent.
  return `https://radio.eplus.dev${path}`;
}

// Keep this list intentionally small: report URLs are public and must never
// contain raw audio URLs, playback tokens, browser fingerprints or history.
const PUBLIC_PLAYBACK_STATES = new Set(['exhausted', 'unsupported', 'offline', 'connecting']);

export function stationReportUrl(path, title, reason) {
  const url = stationShareUrl(path);
  if (!url) return '';

  // Station names are catalog content. Remove control characters and URLs
  // before putting a title in the public GitHub issue draft.
  const safeTitle = String(title || '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().slice(0, 90) || 'Radio station';
  const state = PUBLIC_PLAYBACK_STATES.has(reason) ? reason : 'unknown';

  // GitHub issue forms accept query keys matching their text field IDs.
  // The user reviews/completes the form and submits it explicitly on GitHub.
  const params = new URLSearchParams({
    template: '01-playback.yml',
    title: `[Playback] ${safeTitle}`,
    station_url: url,
    observed_state: `Playback state on this device: ${state}. Please describe what happened.`,
  });
  return `https://github.com/ePlus-DEV/radio.eplus.dev/issues/new?${params}`;
}

export async function shareStation({ url, title }, browser) {
  if (!url) return 'failed';
  if (browser.share) {
    try { await browser.share({ url, title }); return 'shared'; }
    catch (error) { if (error?.name === 'AbortError') return 'cancelled'; }
  }
  try {
    if (!browser.clipboard?.writeText) return 'manual';
    await browser.clipboard.writeText(url);
    return 'copied';
  } catch { return 'manual'; }
}
