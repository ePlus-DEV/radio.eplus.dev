/**
 * The preview build deliberately generates a representative set of pages:
 * normal builds still prerender the complete radio catalog.
 *
 * GitHub Pages cannot host the full catalog once per PR (site limit: 1 GB).
 * The build retains full public search/catalog JSON; after prerender a preview-only
 * compaction removes artwork not needed by representative routes, flags or
 * featured/search QA. Staging and Production never use that compaction.
 */
export const PR_PREVIEW_ROUTES = Object.freeze([
  '/',
  '/asia',
  '/asia/viet-nam',
  '/asia/viet-nam/vov-gt-hcm',
  // Include the two Apple pages needed to QA PR #375's in-app Play/ID3.
  // Only representative Global Radio pages: never prerender the entire catalog.
  '/global-radio',
  '/global-radio/apple-music',
  '/global-radio/apple-music/apple-music-holiday-hits',
  '/library',
  '/settings',
  '/statistics',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-of-use',
  '/cookie-policy',
]);

export function getPrPreviewBasePath(prNumber, repository = '') {
  const number = String(prNumber);
  if (!/^[1-9][0-9]*$/.test(number) || (repository && !/^[a-z0-9][a-z0-9-]*$/.test(repository))) {
    throw new Error('Invalid PR number or Pages repository name');
  }
  return `${repository ? `/${repository}` : ''}/pr-preview/pr-${number}/`;
}

export function isPrPreviewBuild(environment = process.env) {
  return environment.ONAIR_PR_PREVIEW === 'true';
}
