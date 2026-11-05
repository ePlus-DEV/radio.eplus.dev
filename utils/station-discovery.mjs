import { normalizeStationQuery } from './station-search.mjs';

// The search index exposes public *display metadata*, not live stream status.
// Never infer missing genre/language from station names or country.
export const DISCOVERY_PAGE_SIZE = 6;
const VALID_STATION_URL = /^\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/;

export function validDiscoveryStations(stations) {
  if (!Array.isArray(stations)) return [];
  const seen = new Set();
  return stations.filter(item => {
    if (!item || typeof item.url !== 'string' || !VALID_STATION_URL.test(item.url)
      || typeof item.station_name !== 'string' || !item.station_name.trim()
      || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

export function filterDiscoveryStations(stations, { query = '', country = '', genre = '', language = '' } = {}) {
  const words = normalizeStationQuery(query).split(/\s+/).filter(Boolean);
  return validDiscoveryStations(stations).filter(item => {
    if (country && item.station_country !== country) return false;
    if (genre && item.station_category !== genre) return false;
    if (language && item.station_language !== language) return false;
    if (!words.length) return true;
    const haystack = normalizeStationQuery([
      item.station_name, item.country_label, item.station_country,
      item.station_category, item.station_language,
    ].filter(Boolean).join(' '));
    return words.every(word => haystack.includes(word));
  });
}

export function discoveryFacetValues(stations, field, filters = {}) {
  if (!['station_country', 'station_category', 'station_language'].includes(field)) return [];
  // Exclude the facet's own selection to avoid suppressing alternative options.
  const next = { ...filters };
  if (field === 'station_country') delete next.country;
  if (field === 'station_category') delete next.genre;
  if (field === 'station_language') delete next.language;
  return [...new Set(filterDiscoveryStations(stations, next)
    .map(item => typeof item[field] === 'string' ? item[field].trim() : '')
    .filter(Boolean))].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
}

export function paginateDiscoveryStations(stations, options = {}) {
  const filtered = filterDiscoveryStations(stations, options);
  const limit = Number.isInteger(options.limit) && options.limit > 0
    ? Math.min(24, options.limit) : DISCOVERY_PAGE_SIZE;
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const requested = Number.isInteger(options.page) ? options.page : 1;
  const page = Math.max(1, Math.min(pageCount, requested));
  const firstIndex = (page - 1) * limit;
  return {
    items: filtered.slice(firstIndex, firstIndex + limit),
    total,
    page,
    pageCount,
    from: total ? firstIndex + 1 : 0,
    to: Math.min(total, firstIndex + limit),
    hasPrevious: page > 1,
    hasNext: page < pageCount,
  };
}
