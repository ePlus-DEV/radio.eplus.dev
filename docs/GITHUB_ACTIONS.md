# ePlus OnAir — GitHub Actions

Five workflows are currently in use. Check the checked-in YAML for the authoritative behavior.

| File | Trigger | Responsibility |
| --- | --- | --- |
| `build.yml` | Pull requests | Core tests, optional full prerender/SEO audits, optional browser tests |
| `pr-preview-pages.yml` | `pull_request_target` on PRs targeting `develop` | Build noindex previews, publish only after live verification, clean up on close |
| `deploy-github-pages.yml` | Trusted `main` / `develop` push or manual dispatch | Build and publish a static website to the environment's public Pages repo |
| `instant-audio-sync.yml` | Manual dispatch | Research/sync radio data and propose changes for review |
| `publish-station-images.yml` | Manual dispatch | Publish individual station OG JPEGs and manifest on the destination's separate `station-images` branch |

The four non-preview workflows share concurrency group `onair-repository-work` with queued runs retained and `cancel-in-progress: false`. The website workflow checks branch SHA freshness and skips an obsolete queued build. CI checks for closed or stale PR heads before expensive work.

## Release targets

- `develop` → Environment `development` → `ePlus-DEV/onair-staging-pages` → `new-radio.eplus.dev`, when `PAGES_DEV_READY=true`.
- `main` → Environment `production` → `ePlus-DEV/onair-production-pages` → `radio.eplus.dev`, automatically for trusted matching pushes.
- `develop` staging is `noindex` and excludes its sitemap/GA4; `main` production is indexable with a sitemap, canonical tags and production-only GA4. The Pages output validator must reject a `noindex` production build.
- `PAGES_DEPLOY_TOKEN` must have scoped write access to the staging, production and preview output repos; never pass it to the untrusted PR build job.

Website generation is `npm run generate:site`; image generation is `npm run generate:images`. Splitting them keeps website output within GitHub Pages' 1 GB published-site limit. The publisher restores `CNAME` and retains each output repo's root `README.md` despite `rsync --delete`.

## CI testing

Regular PR changes run unit tests; app/data/SEO changes also trigger full Nuxt prerender and output audits. Certain docs/workflow/test-only changes can use a faster path. Browser tests are opt-in using `ENABLE_BROWSER_TESTS=true`.

## Retired workflows

Old one-off VOH import, changelog and incompatible Dependabot auto-merge workflows have been removed. PR #256 (one-off VOH testing reshuffle) was closed without merging and should not be treated as active release guidance.

See [GITHUB_PAGES.md](./GITHUB_PAGES.md) and [SEPARATE_IMAGE_RELEASES.md](./SEPARATE_IMAGE_RELEASES.md) for setup, diagnostics and image strategy.

## PR Preview workflow: trigger, verification and maintenance

- `pr-preview-pages.yml` uses `pull_request_target`. **The workflow definition must be on the default branch `main`**, even though the trigger targets PRs whose base branch is `develop`. Synchronize workflow-only fixes to `develop` as well.
- A merge **into** `develop` does not create a PR preview; opening/reopening/updating a same-repository feature PR against `develop` does.
- The PR build runs without deploy secrets. The trusted publisher reuses the existing development Environment secret `PAGES_DEPLOY_TOKEN` and repository variable `PAGES_DEV_READY=true`; no new token, variable or service is needed.
- The publisher writes `pr-preview/pr-N/preview-commit.txt` with the expected head SHA and verifies that this SHA is publicly served alongside a successful HTTP response containing `noindex` **before** posting/updating a single PR bot comment. A green build, successful cross-repo push or Pages deployment alone must not be reported as a working preview.
- Closed/merged PRs remove only their own `pr-preview/pr-N/` files. **Close smoke-test PRs without merging** (PR #367 is a historical example). Confirm deletion in the output repository.
- For small, explicitly authorized workflow/documentation fixes, commit directly to the correct branches if branch protection allows; **do not open redundant PRs**. For production code, release, credential or high-risk changes, retain review and CI gates.
- See [PR Preview runbook](./PR_PREVIEWS.md).

