# ePlus OnAir — GitHub Actions

Four workflows are currently active. Check the checked-in YAML for the authoritative behavior.

| File | Trigger | Responsibility |
| --- | --- | --- |
| `build.yml` | Pull requests | Core tests, optional full prerender/SEO audits, optional browser tests |
| `pr-preview-pages.yml` | PRs targeting `staging`, including close | Isolated, credential-free preview build followed by token-scoped publication to a dedicated Pages repo and closed-PR cleanup |
| `deploy-github-pages.yml` | Trusted `main` / `staging` push or manual dispatch | Build and publish a static website to the environment's public Pages repo |
| `instant-audio-sync.yml` | Manual dispatch | Research/sync radio data and propose changes for review |

The three non-preview workflows share concurrency group `onair-repository-work` with queued runs retained and `cancel-in-progress: false`. The website workflow checks branch SHA freshness and skips an obsolete queued build. CI checks for closed or stale PR heads before expensive work.

## Release targets

- Feature PR → **Preview** Environment `preview` (trusted jobs after migration) → `ePlus-DEV/onair-pr-previews` → `preview.radio.eplus.dev/pr-preview/pr-N/`, when repository-level `PAGES_PREVIEW_READY=true` (legacy `PAGES_DEV_READY` fallback only if unset).
- `staging` → **Staging** Environment `staging` → `ePlus-DEV/onair-staging-pages` → `stg.radio.eplus.dev` when `PAGES_STAGING_READY=true` (repository variable). If absent, use the legacy `development` Environment and `PAGES_DEV_READY` gate until the new Staging Environment has been configured.
- `main` → Environment `production` → `ePlus-DEV/onair-production-pages` → `radio.eplus.dev`, automatically for trusted matching pushes.
- Development Preview and `staging` Staging are strictly `noindex`, with no sitemap, canonical/JSON-LD or GA4; `main` Production is indexable with a sitemap, canonical tags and production-only GA4. The Pages output validator must reject a `noindex` production build.
- Each tier's `NUXT_PUBLIC_SITE_NAME` Environment Variable sets a distinct browser-tab title (Production `ePlus OnAir`, Staging `ePlus OnAir — Staging`, Preview `ePlus OnAir — Preview`).
- Each tier's `PAGES_DEPLOY_TOKEN` Environment Secret should have scoped write access only to its own output repository; never pass credentials to the untrusted PR build job. Complete [the Environment migration](./ENVIRONMENTS.md) before deleting the legacy Staging values from `development`.

Website publishing uses `npm run generate:site` and intentionally omits per-station OG JPEGs to stay within GitHub Pages' 1 GB limit. Local-only `npm run generate:images` remains available, but **no GitHub Action currently uploads station-image batches**. See [image policy](./SEPARATE_IMAGE_RELEASES.md). The publisher restores `CNAME` and retains each output repo's root `README.md` despite `rsync --delete`.

## CI testing

Regular PR changes run unit tests; app/data/SEO changes also trigger full Nuxt prerender and output audits. Certain docs/workflow/test-only changes can use a faster path. Browser tests are opt-in using `ENABLE_BROWSER_TESTS=true`.

## Retired workflows

Old one-off VOH import, changelog and incompatible Dependabot auto-merge workflows have been removed. The never-used manual `publish-station-images.yml` was retired on 2026-11-06; no `station-images` branches existed in the two Pages destinations, and normal publishing already uses the shared social image. The local generation script and external-image support remain available. PR #256 (one-off VOH testing reshuffle) was closed without merging and should not be treated as active release guidance.

See [GITHUB_PAGES.md](./GITHUB_PAGES.md) and [SEPARATE_IMAGE_RELEASES.md](./SEPARATE_IMAGE_RELEASES.md) for setup, diagnostics and image strategy.

## Isolated GitHub Pages PR previews

Preview publishes to the dedicated `ePlus-DEV/onair-pr-previews` Pages repository. Trusted jobs select the independent `preview` GitHub Environment when `PAGES_PREVIEW_READY=true`, with a Preview-scoped `PAGES_DEPLOY_TOKEN` for publishing/cleanup. Until that repository-level flag is configured, the existing `development`/`PAGES_DEV_READY` configuration remains the legacy fallback. The read-only PR build job has **no Environment secrets** and receives only validated public configuration, including the Preview title. Preview routes are intentionally limited because a full catalog for every PR would exceed the Pages site limit. Details: [PR_PREVIEWS.md](./PR_PREVIEWS.md).

## PR Preview workflow: trigger, verification and maintenance

- `pr-preview-pages.yml` uses `pull_request_target`. **The workflow definition must be on the default branch `main`**, even though the trigger targets PRs whose base branch is `staging`. Synchronize workflow-only fixes to `staging` as well.
- A merge **into** `staging` does not create a PR preview; opening/reopening/updating a same-repository feature PR against `staging` does.
- The PR build runs without deploy secrets. Trusted Preview config/publisher/cleanup jobs use the dedicated `preview` Environment and repository variable `PAGES_PREVIEW_READY=true` after owner-side setup. The `development` Environment / `PAGES_DEV_READY` fallback applies only when the new flag is unset, and `PAGES_PREVIEW_READY=false` disables Preview. The separate `PAGES_STAGING_READY` gate is only for full Staging releases.
- The metadata-only `comment_status` job immediately **removes any old Preview link** and marks it **Building preview…** on PR open/reopen/synchronize. The publisher writes `pr-preview/pr-N/preview-commit.txt`, verifies public 200 HTML/`noindex` and the exact current PR SHA, and restores **Open preview** only if this run still owns the comment. The `finalize_comment` job removes the link on build/publish/verification failure; PR close marks it **Preview expired** before cleanup. A green build, successful cross-repo push or Pages deployment alone must not be reported as a working preview.
- Closed/merged PRs remove only their own `pr-preview/pr-N/` files. **Close smoke-test PRs without merging** (PR #367 is a historical example). Confirm deletion in the output repository.
- For small, explicitly authorized workflow/documentation fixes, commit directly to the correct branches if branch protection allows; **do not open redundant PRs**. For production code, release, credential or high-risk changes, retain review and CI gates.
- See [PR Preview runbook](./PR_PREVIEWS.md) and [three-environment contract](./ENVIRONMENTS.md).

