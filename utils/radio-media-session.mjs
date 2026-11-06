/**
 * Build MediaMetadata fields from current playback state.
 * Artwork priority: song/track image -> station logo -> local site logo.
 * Convert repository-relative image paths to absolute URLs so iOS can fetch
 * them independently of the current page route (including from lock screen).
 */
export function buildRadioMediaMetadata(
  { title, artist, station, artwork, fallbackArtwork } = {},
  origin = '',
) {
  const resolveArtwork = (value) => {
    if (!value || !origin) return '';
    try {
      const url = new URL(value, origin);
      return (url.protocol === 'https:' || url.protocol === 'http:') ? url.href : '';
    } catch {
      return '';
    }
  };

  const image = resolveArtwork(artwork)
    || resolveArtwork(fallbackArtwork)
    || resolveArtwork('/brand/android-chrome-512x512.png');
  const channel = String(station || '').trim();
  return {
    title: String(title || '').trim() || channel || 'ePlus OnAir',
    artist: String(artist || '').trim() || channel || 'ePlus OnAir',
    album: channel || 'ePlus OnAir',
    artwork: image ? [{ src: image }] : [],
  };
}

const LIVE_ACTIONS = ['play', 'pause', 'nexttrack', 'previoustrack', 'seekforward', 'seekbackward'];

// Hardware actions are optional across browsers. Registration and cleanup must
// continue even if one action is unsupported by the current implementation.
export function registerRadioMediaActions(session, { play, pause, next, previous }) {
  // Some iOS versions expose skip controls instead of track controls.
  const handlers = { play, pause, nexttrack: next, previoustrack: previous, seekforward: next, seekbackward: previous };
  for (const action of LIVE_ACTIONS) {
    try { session.setActionHandler(action, handlers[action]); } catch { /* unsupported */ }
  }
  try { session.setActionHandler('seekto', null); } catch { /* unsupported */ }
  return () => {
    for (const action of LIVE_ACTIONS) {
      try { session.setActionHandler(action, null); } catch { /* unsupported */ }
    }
    session.metadata = null;
  };
}
