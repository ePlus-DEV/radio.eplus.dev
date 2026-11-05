// Build an ephemeral player entry. Signed stream URLs must never enter JSON catalogs.
export function createAuthorizedApplePlaybackStation(station, source, placeholder = '/brand/onair-mark.svg') {
  const url = '/global-radio/apple-music/' + station.id;
  return {
    id: station.id,
    title: station.title,
    url,
    image: placeholder,
    area: 'global-radio',
    country: 'apple-music',
    countryKey: 'global_radio.title',
    schedule: '',
    sources: [{
      src: source,
      type: 'application/vnd.apple.mpegurl',
      source: 'primary',
      label: 'Apple Music HLS',
    }],
  };
}
