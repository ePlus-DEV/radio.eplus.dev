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

// Canonical ordering is the literal insertion order of the existing country
// catalog. Do not score variants: a later discovery must never displace an
// older station because of HTTPS, featured flags or a different codec.
