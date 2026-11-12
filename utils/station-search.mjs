/**
 * Lightweight accent-insensitive search for the static radio catalog.
 * Used when Algolia is not configured or a remote search fails.
 */
export const normalizeStationQuery = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/gi, 'd')
  .toLowerCase()
  .trim();

// Immutable client catalog: prepare normalized fields once, without retaining discarded arrays.
const preparedCatalogs = new WeakMap();
const prepare = stations => {
  if (preparedCatalogs.has(stations)) return preparedCatalogs.get(stations);
  const entries = stations.flatMap((station, index) => {
    if (!station || !station.url || !station.station_name) return [];
    return [{ station, index,
      title: normalizeStationQuery(station.station_name),
      country: normalizeStationQuery(station.country_label || station.station_country || ''),
      slug: normalizeStationQuery(station.url.replace(/[-/]/g, ' ')),
    }];
  });
  preparedCatalogs.set(stations, entries);
  return entries;
};

export function searchLocalStations(stations, query, limit = 20) {
  if (!Array.isArray(stations) || limit <= 0) return [];
  const term = normalizeStationQuery(query);
  const words = term.split(/\s+/).filter(Boolean);
  const ranked = prepare(stations).flatMap(({ station, index, title, country, slug }) => {
    if (words.length && !words.every(word => title.includes(word) || country.includes(word) || slug.includes(word))) return [];
    const featuredRank = Number(station.featured_rank || 0);
    const score = !term ? (featuredRank ? 1000 - featuredRank : Number(Boolean(station.featured)) * 10)
      : title === term ? 100
      : title.startsWith(term) ? 80
      : title.includes(term) ? 55
      : slug.includes(term) ? 30
      : 10;
    return [{ station, score, index, featuredRank }];
  });
  ranked.sort((a, b) => {
    if (!term && (a.featuredRank || b.featuredRank)) return (a.featuredRank || 9999) - (b.featuredRank || 9999);
    return b.score - a.score || a.index - b.index;
  });
  return ranked.slice(0, limit).map(({ station }) => station);
}

/**
 * Client-side filter + sort for one already-loaded station list (country page
 * toolbar). Matching mirrors searchLocalStations title semantics: every word
 * of the accent-insensitive query must appear in the normalized station
 * title. Sorting compares normalized titles; ties keep the input order and
 * the input array is never mutated.
 */
export function filterAndSortStations(stations, query, sort = 'default') {
  if (!Array.isArray(stations)) return [];
  const words = normalizeStationQuery(query).split(/\s+/).filter(Boolean);
  const matched = stations.filter(station => {
    if (!words.length) return true;
    const title = normalizeStationQuery(station?.title);
    return words.every(word => title.includes(word));
  });
  if (sort !== 'az' && sort !== 'za') return matched;
  const direction = sort === 'az' ? 1 : -1;
  return matched
    .map((station, index) => ({ station, index, key: normalizeStationQuery(station?.title) }))
    .sort((a, b) => {
      const order = a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
      return order * direction || a.index - b.index;
    })
    .map(({ station }) => station);
}

export function filterQueueStations(stations, query, favoriteUrls, favoritesOnly) {
  // Match every query word independently, like the header and country searches.
  // A phrase such as "giao minh" should find "VOV Giao Thông Hồ Chí Minh".
  const words = normalizeStationQuery(query).split(/\s+/).filter(Boolean);
  const favorites = new Set(favoriteUrls);
  return stations.filter(station => (!favoritesOnly || favorites.has(station.url))
    && words.every(word => normalizeStationQuery(station.title).includes(word)));
}

/**
 * Algolia does not index Global Radio provider pages. Keep their static results
 * visible even after an Algolia response arrives, without changing its ranking
 * of existing country stations or duplicating results by URL.
 */
// Algolia can still contain outdated alternative catalog URLs until its index
// is refreshed. Map those to the canonical LOCAL result, but only when the
// local catalog has exactly one station with that name in the same country.
// Never combine two countries, Global providers, or ambiguous same-name radios.
function geographicHitKey(hit) {
  if (!hit || typeof hit.url !== 'string') return '';
  const parts = hit.url.split('/');
  if (parts.length !== 4 || parts[0] || !parts[1] || !parts[2] || !parts[3]
    || parts[1] === 'global-radio') return '';
  const title = normalizeStationQuery(hit.station_name).replace(/\s+/g, ' ');
  return title ? parts[1] + '/' + parts[2] + '/' + title : '';
}

export function mergeGlobalSearchHits(localHits, remoteHits, limit = 20) {
  const local = Array.isArray(localHits) ? localHits : [];
  const global = local
    .filter(item => typeof item?.url === 'string' && item.url.startsWith('/global-radio/'));
  const remote = Array.isArray(remoteHits) ? remoteHits : [];
  // Algolia can legitimately return zero hits for a station known by the
  // freshly generated static index (for example, while remote sync lags).
  // Never erase visible local Country matches merely because that empty
  // response arrived. A response with valid URLs keeps its Algolia ranking.
  const usableRemote = remote.filter(item => item && typeof item.url === 'string'
    && item.url.startsWith('/') && !item.url.startsWith('//'));
  if (!usableRemote.length) return local.slice(0, Math.max(0, limit));

  const canonical = new Map();
  for (const item of local) {
    const key = geographicHitKey(item);
    if (!key) continue;
    // null means the local index intentionally contains distinct same-name
    // broadcasters; never collapse those based on title alone.
    canonical.set(key, canonical.has(key) ? null : item);
  }
  const seen = new Set();
  return [...global, ...usableRemote.map(item => canonical.get(geographicHitKey(item)) || item)]
    .filter(item => {
      if (!item || typeof item.url !== 'string' || !item.url.startsWith('/') ||
        item.url.startsWith('//') || seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    }).slice(0, Math.max(0, limit));
}
