# Release the website before station images

The website and generated station Open Graph images have independent builds.
Station logos already checked into `public/img` remain part of the website;
there is no blank artwork or repeated logo generation during a release.

## Publish the website immediately

The Pages workflow and PR CI run `npm run generate:site`. It generates search,
brand assets and all HTML but omits station OG JPEGs, including stale JPEGs
left in a warm checkout. Until a complete external image set is configured,
station pages use the existing `/brand/social-preview.png`. SEO indexing and
canonical URLs remain controlled by the existing environment settings.

For local generation: `npm run generate:site`.
Post-build audits must use `ONAIR_SKIP_STATION_OG=true`, as the workflows do.
The original `npm run generate` still supports a full local image build.

## Upload station images separately

1. Select the intended source branch (`main` for released source, or `develop`
   for staging) and run **Publish station images separately** in Actions.
2. Choose the production or development destination. It uses the same
   Environment-scoped `PAGES_DEPLOY_TOKEN` as website publishing.
3. Existing JPEGs and their manifest are restored before `npm run generate:images`.
   Unchanged images are reused. Changes push to `station-images` in batches of
   at most 100 MiB. This branch is separate from the Pages website source `main`.
4. Wait for **Report complete image set**. It reports a public immutable base URL
   containing the final commit SHA; the completion manifest is committed last.
5. Set `STATION_OG_BASE_URL` in the source repository or the matching Environment
   to that exact URL, then rerun the website deployment. Repository scope also
   supplies this value to PR CI. New station catalogs must have matching image
   uploads before using their new URL.

Website metadata references external JPEGs only when the base URL is supplied.
All-station audits validate the complete external manifest against every route.
Clearing `STATION_OG_BASE_URL` immediately restores shared-card builds.

If an image upload fails, rerun it. Already uploaded identical images do not
need another push. No partial upload is activated automatically. Subsequent
uploads cannot break the previously deployed immutable image URLs.

The external GitHub raw URLs serve static public share-card images. A CDN can
replace the base URL later if it serves the same paths and complete manifest.
Do not put the JPEGs back into the Pages website output: pushing smaller chunks
does not increase GitHub Pages' 1 GB published-site limit.
