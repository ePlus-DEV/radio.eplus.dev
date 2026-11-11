/**
 * Vue Router LocationQueryValue is string | null, while repeated keys become
 * arrays. A bare `?q` contributes null. Never call .trim() on raw values.
 */
export function parseSearchQueryParam(raw) {
  const entries = Array.isArray(raw) ? raw : [raw];
  const firstUseful = entries.find(value => typeof value === 'string' && value.trim().length > 0);
  return typeof firstUseful === 'string' ? firstUseful.trim() : '';
}
