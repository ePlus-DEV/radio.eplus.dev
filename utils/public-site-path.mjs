/**
 * Prefix root-relative PUBLIC FILE URLs with the Nuxt application base.
 * Routing is handled separately by NuxtLink / Vue Router, so do not rewrite
 * station route IDs or audio stream URLs.
 */
export function prefixPublicAsset(path, baseURL = '/') {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return path;
  const base = '/' + String(baseURL).replace(/^\\/+|\\/+$/g, '') + '/';
  if (base === '//') return path;
  const normalized = base.replace(/\\/{2,}/g, '/');
  if (path === normalized.slice(0, -1) || path.startsWith(normalized)) return path;
  return normalized + path.slice(1);
}
