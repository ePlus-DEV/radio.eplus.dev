// A browser-only playback label must not replace the route's prerendered SEO title.
// Keep the normal Nuxt title template when the player is paused or idle.
export function buildPlaybackTitleTemplate(activeStationTitle, siteName) {
  const brand = String(siteName || 'ePlus OnAir').trim() || 'ePlus OnAir';
  const station = String(activeStationTitle || '').trim();
  return station ? () => `▶ ${station} | ${brand}` : `%s | ${brand}`;
}
