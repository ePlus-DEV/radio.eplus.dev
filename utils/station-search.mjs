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

export function searchLocalStations(stations, query, limit = 20) {
  if (!Array.isArray(stations) || limit <= 0) return [];
  const term = normalizeStationQuery(query);
  const words = term.split(/\s+/).filter(Boolean);
  const ranked = stations.flatMap((station, index) => {
    if (!station || !station.url || !station.station_name) return [];
    const title = normalizeStationQuery(station.station_name);
    const country = normalizeStationQuery(station.country_label || station.station_country || '');
    const slug = normalizeStationQuery(station.url.replace(/[-/]/g, ' '));
    if (words.length && !words.every(word => title.includes(word) || country.includes(word) || slug.includes(word))) return [];
    const score = !term ? Number(Boolean(station.featured)) * 10
      : title === term ? 100
      : title.startsWith(term) ? 80
      : title.includes(term) ? 55
      : slug.includes(term) ? 30
      : 10;
    return [{ station, score, index }];
  });
  ranked.sort((a, b) => b.score - a.score || a.index - b.index);
  return ranked.slice(0, limit).map(({ station }) => station);
}
