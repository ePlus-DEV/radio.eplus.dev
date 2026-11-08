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

// Create an editable email draft with public station details only.
// Never add raw stream URLs, signed tokens, identity or listening history.
export function stationReportEmailUrl(path, title, subject, description) {
  const stationPage = stationShareUrl(path);
  if (!stationPage) return '';
  const safeTitle = String(title || '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().slice(0, 90) || 'Radio station';
  const safeSubject = String(subject || 'ePlus OnAir - Radio playback problem')
    .replace(/[\r\n]/g, ' ').trim().slice(0, 120);
  const message = String(description || 'I cannot hear this station.').slice(0, 1000);
  // Localized templates may place the station name and public URL directly in
  // the email. Preserve the previous plain-text fallback for older callers.
  const hasPlaceholders = message.includes('{station}') && message.includes('{url}');
  const body = hasPlaceholders
    ? message.replace(/\{(station|url)\}/g, (_match, key) => key === 'station' ? safeTitle : stationPage)
    : message + '\n\n' + safeTitle + '\n' + stationPage;

  // mailto URLs follow RFC 6068, not HTML form encoding. URLSearchParams
  // produces "+" for spaces, which iOS Mail can show literally in drafts.
  // Percent-encode text using %20 and CRLF line breaks (%0D%0A) instead.
  return 'mailto:report@eplus.dev?subject=' + encodeURIComponent(safeSubject)
    + '&body=' + encodeURIComponent(body.replace(/\r?\n/g, '\r\n'));
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
