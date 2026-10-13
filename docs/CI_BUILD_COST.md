# ePlus OnAir CI build-cost policy

The private source uses **`develop` for staging** and **`main` for production**.
This document is about PR validation only, not publishing or DNS.

## Two CI paths

- **Fast CI (no `nuxt generate`)**: README/docs, tests,
  `.github/workflows/**`, Dependabot config, `scripts/assert-*.mjs`
  and `scripts/check-pages-build.mjs`. Unit tests continue to run and
  cover the audit scripts. The full PR diff relative to its base is checked,
  not just the newest commit.
- **Full CI**: all app, build config, radio data, images, `package*.json`,
  pre-generation scripts, and any other unrecognized file. Full CI still
  runs `nuxt generate`, SEO/indexing checks, static-asset audits and Pages
  size tests; unknown files fail closed into Full CI.

This means that a PR that once changed site output will **continue** to run
Full CI on each update until it is merged, even if its last commit touched only
a test. This is intentional safety behavior.

## Cache of deterministic pre-generation outputs

Full CI restores these separately with `actions/cache@v4`:

| Generated file | Exact cache inputs |
| --- | --- |
| `public/search/stations.json` | `public/radio/**/*.json`, `utils/featured-stations.mjs`, `scripts/build-station-search-index.mjs` |
| `public/brand/social-preview.png` | `public/brand/social-preview.svg`, `scripts/generate-social-preview.mjs`, `package-lock.json` |

When and only when the exact key hits, the respective pregeneration script
checks its restored file before reusing it. A missing, corrupt or unexpected
file triggers regeneration. Local `npm run generate` without the cache-hit
variables still generates assets normally.

GitHub Actions runners are disposable. **This is content-addressed reuse, not
a guaranteed "run once forever" switch**: cache eviction or changed source
creates a miss. Caches are smaller than an entire prerendered site and never
replace the build/SEO/size checks for real app changes.

This PR does not optimize the **publish** workflow, which still generates and
pushes after opt-in; publishing optimization needs a separate guarded update
after the current custom-domain PR is merged to `develop`.
