// Hand-picked radio streams for the homepage. Keep the user-facing selection
// separate from the full catalog: unavailable VOV 1/2/3/5 must not reappear as
// featured stations just because the catalog order or favorite flags change.
export const VIETNAM_FEATURED_STATION_IDS = Object.freeze([
  'vov-gt-hcm',
  'rap-viet-radio-zing-mp3',
  'edm-radio-zing-mp3',
  'us-uk-radio-zing-mp3',
  'vpop-radio-zing-mp3',
  'chill-zing-mp3',
  'kpop-radio-zing-mp3',
  'bolero-zing-mp3',
  'cham-radio-zing-mp3',
  'acoustic-radio-zing-mp3',
]);

export function selectVietnamFeaturedStations(catalog) {
  if (!catalog || typeof catalog !== 'object') return [];
  return VIETNAM_FEATURED_STATION_IDS.flatMap(id => {
    const station = catalog[id];
    // Do not render stale entries without a usable stream or station name.
    if (!station || !station.title || !/^https?:\/\//i.test(String(station.stream || ''))) return [];
    return [[id, station]];
  });
}
