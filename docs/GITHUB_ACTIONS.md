# ePlus OnAir — GitHub Actions

Four workflows are currently in use. Check the checked-in YAML for the authoritative behavior.

| File | Trigger | Responsibility |
| --- | --- | --- |
| `build.yml` | Pull requests | Core tests, optional full prerender/SEO audits, optional browser tests |
| `deploy-github-pages.yml` | Trusted `main` / `develop` push or manual dispatch | Build and publish a static website to the environment's public Pages repo |
| `instant-audio-sync.yml` | Manual dispatch | Research/sync radio data and propose changes for review |
| `publish-station-images.yml` | Manual dispatch | Publish individual station OG JPEGs and manifest on the destination's separate `station-images` branch |

All four share concurrency group `onair-repository-work` with queued runs retained and `cancel-in-progress: false`. The website workflow checks branch SHA freshness and skips an obsolete queued build. CI checks for closed or stale PR heads before expensive work.

## Release targets

- `develop` → Environment `development` → `ePlus-DEV/onair-staging-pages` → `new-radio.eplus.dev`, when `PAGES_DEV_READY=true`.
- `main` → Environment `production` → `ePlus-DEV/onair-production-pages` → `radio.eplus.dev`, automatically for trusted matching pushes.
- `develop` staging is `noindex` and excludes its sitemap/GA4; `main` production is indexable with a sitemap, canonical tags and production-only GA4. The Pages output validator must reject a `noindex` production build.
- `PAGES_DEPLOY_TOKEN` must have scoped write access to the two output repos; never pass it to PR workflows.

Website generation is `npm run generate:site`; image generation is `npm run generate:images`. Splitting them keeps website output within GitHub Pages' 1 GB published-site limit. The publisher restores `CNAME` and retains each output repo's root `README.md` despite `rsync --delete`.

## CI testing

Regular PR changes run unit tests; app/data/SEO changes also trigger full Nuxt prerender and output audits. Certain docs/workflow/test-only changes can use a faster path. Browser tests are opt-in using `ENABLE_BROWSER_TESTS=true`.

## Retired workflows

Old one-off VOH import, changelog and incompatible Dependabot auto-merge workflows have been removed. PR #256 (one-off VOH testing reshuffle) was closed without merging and should not be treated as active release guidance.

See [GITHUB_PAGES.md](./GITHUB_PAGES.md) and [SEPARATE_IMAGE_RELEASES.md](./SEPARATE_IMAGE_RELEASES.md) for setup, diagnostics and image strategy.
