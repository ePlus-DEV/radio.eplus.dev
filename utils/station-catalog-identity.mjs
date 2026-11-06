// Identity for duplicate station listings. Do not deduplicate solely by title:
// different broadcasters can share a name, even within the same country.
export function normalizeStationTitle(value = '') {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/\s+/g, ' ');
}

export function normalizeStationHomepage(value = '') {
  try {
    const url = new URL(String(value || '').trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const path = url.pathname.replace(/\/+$/, '').toLowerCase() || '/';
    return host + path;
  } catch {
    return '';
  }
}

// This is scoped to an individual country by its callers; identical names
// with different official sites are treated as distinct stations.
export function stationCatalogIdentity(station) {
  const name = normalizeStationTitle(station?.title);
  const home = normalizeStationHomepage(station?.url);
  return name && home ? name + '\u0000' + home : '';
}

// Prefer stable curated routes and secure streams over generated aliases.
// Keeps links, favorites and existing SEO pages unchanged.
export function stationListingPriority(slug, station, featuredRank = 0) {
  return (featuredRank ? 100_000 - featuredRank : 0)
    + (station?.favorite === true ? 10_000 : 0)
    + (!/(?:-instant-audio)(?:-\d+)?$/.test(String(slug)) ? 1000 : 0)
    + (/^https:\/\//i.test(String(station?.stream || '')) ? 100 : 0)
    + (!String(station?.source || '').startsWith('radio-browser:') ? 10 : 0);
}
