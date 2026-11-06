# ePlus OnAir — GitHub Actions

Four workflows are currently active. Check the checked-in YAML for the authoritative behavior.

| File | Trigger | Responsibility |
| --- | --- | --- |
| `build.yml` | Pull requests | Core tests, optional full prerender/SEO audits, optional browser tests |
| `pr-preview-pages.yml` | PRs targeting `develop`, including close | Isolated, credential-free preview build followed by token-scoped publication to a dedicated Pages repo and closed-PR cleanup |
| `deploy-github-pages.yml` | Trusted `main` / `develop` push or manual dispatch | Build and publish a static website to the environment's public Pages repo |
| `instant-audio-sync.yml` | Manual dispatch | Research/sync radio data and propose changes for review |

The three non-preview workflows share concurrency group `onair-repository-work` with queued runs retained and `cancel-in-progress: false`. The website workflow checks branch SHA freshness and skips an obsolete queued build. CI checks for closed or stale PR heads before expensive work.

## Release targets

- Feature PR → **Development** Environment `development` (trusted jobs only) → `ePlus-DEV/onair-pr-previews` → `preview.radio.eplus.dev/pr-preview/pr-N/`, when `PAGES_DEV_READY=true`.
- `develop` → **Staging** Environment `staging` → `ePlus-DEV/onair-staging-pages` → `stg.radio.eplus.dev` when `PAGES_STAGING_READY=true` (repository variable). If absent, use the legacy `development` Environment and `PAGES_DEV_READY` gate until the new Staging Environment has been configured.
- `main` → Environment `production` → `ePlus-DEV/onair-production-pages` → `radio.eplus.dev`, automatically for trusted matching pushes.
- Development Preview and `develop` Staging are strictly `noindex`, with no sitemap, canonical/JSON-LD or GA4; `main` Production is indexable with a sitemap, canonical tags and production-only GA4. The Pages output validator must reject a `noindex` production build.
- Each tier's `PAGES_DEPLOY_TOKEN` Environment Secret should have scoped write access only to its own output repository; never pass credentials to the untrusted PR build job. Complete [the Environment migration](./ENVIRONMENTS.md) before deleting the legacy Staging values from `development`.

Website publishing uses `npm run generate:site` and intentionally omits per-station OG JPEGs to stay within GitHub Pages' 1 GB limit. Local-only `npm run generate:images` remains available, but **no GitHub Action currently uploads station-image batches**. See [image policy](./SEPARATE_IMAGE_RELEASES.md). The publisher restores `CNAME` and retains each output repo's root `README.md` despite `rsync --delete`.

## CI testing

Regular PR changes run unit tests; app/data/SEO changes also trigger full Nuxt prerender and output audits. Certain docs/workflow/test-only changes can use a faster path. Browser tests are opt-in using `ENABLE_BROWSER_TESTS=true`.

## Retired workflows

Old one-off VOH import, changelog and incompatible Dependabot auto-merge workflows have been removed. The never-used manual `publish-station-images.yml` was retired on 2026-11-06; no `station-images` branches existed in the two Pages destinations, and normal publishing already uses the shared social image. The local generation script and external-image support remain available. PR #256 (one-off VOH testing reshuffle) was closed without merging and should not be treated as active release guidance.

See [GITHUB_PAGES.md](./GITHUB_PAGES.md) and [SEPARATE_IMAGE_RELEASES.md](./SEPARATE_IMAGE_RELEASES.md) for setup, diagnostics and image strategy.

## Isolated GitHub Pages PR previews

Preview publishing reuses the existing `PAGES_DEV_READY=true` setting and uses the dedicated `ePlus-DEV/onair-pr-previews` output repository. It uses a read-only build job (no deployment secrets), a trusted publishing job with existing development-scoped `PAGES_DEPLOY_TOKEN`, and per-PR cleanup. Preview routes are intentionally limited because a full catalog for every PR would exceed the Pages site limit. Details: [PR_PREVIEWS.md](./PR_PREVIEWS.md).

## PR Preview workflow: trigger, verification and maintenance

- `pr-preview-pages.yml` uses `pull_request_target`. **The workflow definition must be on the default branch `main`**, even though the trigger targets PRs whose base branch is `develop`. Synchronize workflow-only fixes to `develop` as well.
- A merge **into** `develop` does not create a PR preview; opening/reopening/updating a same-repository feature PR against `develop` does.
- The PR build runs without deploy secrets. Trusted Preview config/publisher/cleanup jobs use the dedicated `development` Environment and repository variable `PAGES_DEV_READY=true`. The independent `PAGES_STAGING_READY` flag is only for full Staging releases, not for Preview.
- The publisher writes `pr-preview/pr-N/preview-commit.txt` with the expected head SHA and verifies that this SHA is publicly served alongside a successful HTTP response containing `noindex` **before** posting/updating a single PR bot comment. A green build, successful cross-repo push or Pages deployment alone must not be reported as a working preview.
- Closed/merged PRs remove only their own `pr-preview/pr-N/` files. **Close smoke-test PRs without merging** (PR #367 is a historical example). Confirm deletion in the output repository.
- For small, explicitly authorized workflow/documentation fixes, commit directly to the correct branches if branch protection allows; **do not open redundant PRs**. For production code, release, credential or high-risk changes, retain review and CI gates.
- See [PR Preview runbook](./PR_PREVIEWS.md) and [three-environment contract](./ENVIRONMENTS.md).

