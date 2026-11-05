/**
 * The preview build deliberately generates a representative set of pages:
 * normal builds still prerender the complete radio catalog.
 *
 * GitHub Pages cannot host the full catalog once per PR (site limit: 1 GB).
 * All public catalog JSON and artwork are still copied by Nuxt.
 */
export const PR_PREVIEW_ROUTES = Object.freeze([
  '/',
  '/asia',
  '/asia/viet-nam',
  '/asia/viet-nam/vov-gt-hcm',
  '/library',
  '/settings',
  '/statistics',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-of-use',
  '/cookie-policy',
]);

export function getPrPreviewBasePath(prNumber, repository = 'onair-pr-previews') {
  const number = String(prNumber);
  if (!/^[1-9][0-9]*$/.test(number) || !/^[a-z0-9][a-z0-9-]*$/.test(repository)) {
    throw new Error('Invalid PR number or Pages repository name');
  }
  return `/${repository}/pr-preview/pr-${number}/`;
}

export function isPrPreviewBuild(environment = process.env) {
  return environment.ONAIR_PR_PREVIEW === 'true';
}
