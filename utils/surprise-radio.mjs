// Only publicly listed, canonical catalog entries can be discovered.
// This is not a live-health check: the browser verifies playback after selection.
const CANONICAL_STATION_PATH = /^\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/;

// A selection must not activate after the listener changes filters or playback.
export function isSurpriseRequestCurrent(snapshot, current) {
  return snapshot.path === current.path && snapshot.station === current.station
    && snapshot.playRequest === current.playRequest && snapshot.pauseRequest === current.pauseRequest
    && snapshot.requestedUrl === current.requestedUrl && snapshot.country === current.country
    && snapshot.genre === current.genre && snapshot.language === current.language;
}

export function randomStationCandidates(stations, filters = {}) {
  if (!Array.isArray(stations)) return [];
  const seen = new Set();
  return stations.filter(station => {
    if (!station || typeof station.url !== 'string'
      || !CANONICAL_STATION_PATH.test(station.url)
      // Global provider pages are discoverable, but not country-based direct streams.
      || station.url.startsWith('/global-radio/')
      || typeof station.station_name !== 'string' || !station.station_name.trim()
      || seen.has(station.url)) return false;
    if (filters.country && station.station_country !== filters.country) return false;
    if (filters.genre && station.station_category !== filters.genre) return false;
    if (filters.language && station.station_language !== filters.language) return false;
    seen.add(station.url);
    return true;
  });
}

export function pickRandomStation(stations, filters = {}, random = Math.random) {
  const pool = randomStationCandidates(stations, filters);
  if (!pool.length) return null;
  // A failed catalog request is evidence only for this browser session, not a
  // permanent live-health verdict. Prefer unfailed stations when alternatives
  // exist, but allow explicit retries when every matching station has failed.
  const failed = new Set(Array.isArray(filters.failedUrls) ? filters.failedUrls : []);
  const unfailed = pool.filter(item => !failed.has(item.url));
  const candidates = unfailed.length ? unfailed : pool;
  // Never immediately repeat the last selection if an alternative exists.
  const withoutPrevious = candidates.length > 1
    ? candidates.filter(item => item.url !== filters.previousUrl)
    : candidates;
  const eligible = withoutPrevious.length ? withoutPrevious : candidates;
  const roll = Number(random());
  const unit = Number.isFinite(roll) ? Math.min(1 - Number.EPSILON, Math.max(0, roll)) : 0;
  return eligible[Math.floor(unit * eligible.length)] || null;
}

export function randomStationFacets(stations, field, filters = {}) {
  const values = new Set(randomStationCandidates(stations, filters)
    .map(item => String(item[field] || '').trim()).filter(Boolean));
  return [...values].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
}
