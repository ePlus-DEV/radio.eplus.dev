// Build an ephemeral player entry. Signed stream URLs must never enter JSON catalogs.
export function createAuthorizedApplePlaybackStation(station, source, placeholder = '/brand/onair-mark.svg') {
  const url = '/global-radio/apple-music/' + station.id;
  return {
    id: station.id,
    title: station.title,
    url,
    image: station.image || placeholder,
    area: 'global-radio',
    country: 'apple-music',
    countryKey: 'global_radio.title',
    schedule: '',
    // A saved station can restore its public identity without an expiring HLS
    // accessKey. A fresh signed source is fetched only after explicit Play.
    sources: source ? [{
      src: source,
      type: 'application/vnd.apple.mpegurl',
      source: 'primary',
      label: 'Apple Music HLS',
    }] : [],
  };
}


// Keep Global Radio's player queue identical in structure to Country Radio.
// These are catalog-only entries: no stream URL, accessKey, or stale HLS state.
export function createAppleRadioQueue(stations, placeholder = '/brand/onair-mark.svg') {
  const seen = new Set();
  return (Array.isArray(stations) ? stations : []).flatMap(station => {
    if (!station || typeof station.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(station.id)
      || seen.has(station.id)) return [];
    seen.add(station.id);
    return [{
      id: station.id,
      title: String(station.title || station.id),
      image: station.image || placeholder,
      url: '/global-radio/apple-music/' + station.id,
    }];
  });
}

/**
 * Country station deep links initialize themselves and take precedence over
 * saved history. Global Radio detail pages are different: browsing a detail
 * route does NOT select its station or stop the active Global stream. Thus F5
 * must restore the actual last selected Global station, even when the visitor
 * is looking at a different Apple Music detail page.
 */
export function canRestoreSavedStationOnRoute(savedUrl, routePath) {
  if (typeof routePath !== 'string') return false;
  const path = routePath.replace(/\/+$/, '') || '/';
  if (path.split('/').filter(Boolean).length < 3) return true;
  return typeof savedUrl === 'string'
    && savedUrl.startsWith('/global-radio/apple-music/')
    && /^\/global-radio\/apple-music\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path);
}
