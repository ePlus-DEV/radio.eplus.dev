# GitHub Pages: visual preview for each pull request

## Architecture

Three environments are kept isolated; Development is a temporary PR Preview tier, not a permanent `dev` source branch. Production and Staging remain full-site deployments. See [ENVIRONMENTS.md](./ENVIRONMENTS.md).

- `main` -> `ePlus-DEV/onair-production-pages` -> `https://radio.eplus.dev`
- `staging` -> `ePlus-DEV/onair-staging-pages` -> `https://stg.radio.eplus.dev`
- **Development feature PR targeting `staging`** -> GitHub Environment `preview` (trusted config/publisher/cleanup after migration) -> dedicated `ePlus-DEV/onair-pr-previews` Pages repository -> `https://preview.radio.eplus.dev/pr-preview/pr-<number>/`

Do not put previews inside the staging or production output repository. As of 2026-11-05, the staging Pages `main` tree already contains ~962.8 MB of files, close to GitHub Pages' 1 GB published-site limit.

## One-time setup required (repository owner)

1. Create a **PUBLIC** GitHub repository named `ePlus-DEV/onair-pr-previews`. Initialize it with a README and an initial `main` branch. Do not use a name containing `.github.io`; it is a project Pages site. The existing root `CNAME` file must contain exactly `preview.radio.eplus.dev`.
2. In that repo's **Settings -> Pages**, set **Build and deployment -> Source: Deploy from a branch**, `main` / `/(root)`. Set **Custom domain: `preview.radio.eplus.dev`** in Pages Settings, with a Cloudflare DNS-only CNAME `preview.radio` -> `eplus-dev.github.io`, and enable **Enforce HTTPS** once the certificate is ready. Keep Pages publishing from `main` / `/(root)`.
3. In the source repository's **`preview` Environment**, configure a **separate fine-grained `PAGES_DEPLOY_TOKEN` Secret** granting `Contents: Read and write` **only** to `ePlus-DEV/onair-pr-previews`. Do not grant this Preview token write access to the Staging or Production Pages repositories. The former `development` Environment token may remain temporarily for the legacy fallback until the new Preview readiness flag is enabled. Do not put tokens in PR build jobs, project files or comments.
4. The workflow selects the dedicated **Preview** Environment with repository-level `PAGES_PREVIEW_READY=true` after its secret and public variables are ready. Only if that flag is absent does it fall back to the legacy `development` Environment and `PAGES_DEV_READY=true` gate. Staging migrates independently to `PAGES_STAGING_READY=true` (repository variable) after its own `staging` GitHub Environment is provisioned. The same output repository/domain remain in use; only the GitHub Environment and per-tier credentials/configuration change. Keep `.github/workflows/pr-preview-pages.yml` on **both `main` (GitHub default branch) and `staging`**: the `pull_request_target` workflow is loaded from `main` but only targets PRs against `staging`. No application or production deployment changes are required.

The source repo's `.github/workflows/pr-preview-pages.yml` creates and updates an individual directory for each qualifying PR, and removes the directory when its PR is closed or merged. Opening/reopening/updating a same-repository feature PR targeting `staging` triggers the preview; **merging into `staging` does not trigger a preview for that merge**. On PR open/reopen/synchronize, a trusted **metadata-only comment job immediately replaces the prior Preview link** with **Building preview…** and a workflow-status link. After successful build and push, the publisher runs **one bounded live check** for the published SHA and `noindex`, without waiting for CDN propagation. The existing comment shows **Open preview** only when verified. Otherwise it shows **Preview publishing** and a clearly labeled tentative link; the live URL can temporarily show an older build or a 404. Build/push failure still triggers **Preview unavailable** with no link. PR SHA and workflow run ownership are checked before changing the comment. A closed PR switches the comment to **Preview expired** before cleaning up its files. Its GitHub Pages link includes only the PR path under the custom domain, without the legacy `/onair-pr-previews/` prefix.

The custom domain is configured in the output repo and the source workflow uses `NUXT_APP_BASE_URL=/pr-preview/pr-<number>/`. Keep `utils/pr-preview.mjs`, `scripts/assert-pr-preview-output.mjs` and the publisher's path assertions in sync; changing DNS alone leaves stale Nuxt asset paths.

## Security model

- The workflow uses `pull_request_target`: its **trusted workflow definition must come from the GitHub default branch `main`**, while the trigger's `branches: [staging]` filters the PR base branch. Keep the same workflow file on both `main` and `staging`. **The untrusted checkout and npm build run in a separate read-only job**, with `persist-credentials: false`, no deploy secrets and no Environment access.
- Only same-repository PRs targeting `staging` are built; fork PRs and bot synchronization branches are excluded.
- The trusted publication job downloads the static artifact and **never executes scripts from the PR or checks out its code**. It rechecks current PR state/base/head SHA before publishing. A closed or updated PR cannot publish an obsolete commit.
- The Preview Environment's own scoped `PAGES_DEPLOY_TOKEN` is used for authenticated Git clone/push of `ePlus-DEV/onair-pr-previews`. It never changes the source `staging`/`main` branches or other Pages output repos.
- Preview's trusted config job validates public `NUXT_PUBLIC_SITE_NAME` and forwards it to the read-only PR build; the fallback title is `ePlus OnAir — Preview`. No secret or Environment credential enters the untrusted job. Staging and Production use separate title variables.
- Branch-independent build settings force `NUXT_PUBLIC_NO_INDEX=true`, no production GA4, no sitemap, `ONAIR_SKIP_STATION_OG=true`, and per-PR base URLs. Production SEO content, titles, canonical policy and GA4 settings stay unchanged.
- Closed PR cleanup is independent of the build and only removes `pr-preview/pr-<number>/` after checking that the PR is still closed. Reopening the PR creates a new preview.
- The preview website is public. Do not place secrets or private test datasets in preview pages.

## Deliberately light builds

One full static catalog per open PR would exceed GitHub Pages' **1 GB published-site limit**. Therefore only a representative set of pages is prerendered, via `ONAIR_PR_PREVIEW=true`:

- Homepage and `/asia` discovery.
- Vietnam country page and `/asia/viet-nam/vov-gt-hcm` station deep link.
- Library, Settings, Statistics and static informational pages.

The full-site `main` Production and `staging` Staging route sets remain **completely unchanged** by Development Preview build limits. The preview still contains Nuxt static assets, public radio JSON catalogs and artwork, but **unprerendered detail routes may not load on direct refresh**. Use staging after merge for whole-catalog and complete SEO testing; do not mistake partial static preview for an E2E production equivalent.

Build gate checks run existing unit tests, `assert-staging-noindex`, `assert-ga4-output` (**development** target), `check-pages-build` (**development** target) plus `assert-pr-preview-output`. Publication also rejects absent station/home HTML, invalid subpaths, production GA4, symlinks, and an aggregate public output of 900 MB or more.

## Manual smoke check after initial setup

1. Open a small PR against `staging` from a branch in `ePlus-DEV/radio.eplus.dev`.
2. Check GitHub Actions **PR Preview — GitHub Pages**: read-only build, then trusted publish.
3. After publishing, the bot reports either **Preview ready** (matching public SHA and `noindex` verified) or **Preview publishing** (URL may still serve old files or 404). Only treat it as ready when `pr-preview/pr-N/preview-commit.txt` shows the intended PR head SHA; then verify homepage (dark/light), mobile navigation, player, library and the Vietnam station deep link.
4. Verify HTML has `noindex`, no production GA4 and that CSS, JS, logo, favicon, images and station JSON load under the PR path. Note that GitHub Pages branch publishing may take additional time after the commit.
5. Push a second commit; confirm the comment tracks the current PR SHA. While Pages still deploys, it must say **Preview publishing**, not incorrectly claim the new build is ready. **Close the smoke-test PR without merging**; confirm its directory disappears from the Pages output repository. PR [#367](https://github.com/ePlus-DEV/radio.eplus.dev/pull/367) is the earlier closed/unmerged smoke test.

If the action fails before publish: ensure the new Pages repository has a `main` branch, the token has **Contents write** to that exact repo, the `preview` Environment permits the job with `PAGES_PREVIEW_READY=true` (or legacy `development`/`PAGES_DEV_READY` only if the new flag is absent). If a build becomes too large, add only necessary representative routes rather than copying all 4,000+ station pages into each PR.

## Expired, missing, or failed preview links

The **output repository** `ePlus-DEV/onair-pr-previews` has a root-level `404.html`, separate from Nuxt's per-preview `404.html`. Missing/unprerendered and expired preview URLs use a **5-second visible countdown**, with a manual "Open live page now" link, before a client-side redirect to the **matching production route**. For example, `/pr-preview/pr-375/global-radio/apple-music/` redirects to `https://radio.eplus.dev/global-radio/apple-music/` and preserves the query string and fragment. Unknown/non-PR routes fall back to `https://radio.eplus.dev/`. GitHub Pages still serves HTTP **404** (not 301/302); do not report the countdown as server-side redirect or a successful preview build.

- Keep the root `CNAME`, `404.html`, `index.html`, `.nojekyll` and `README.md` when publishing or deleting any individual PR's preview.
- Never write fallback/redirect logic into the production site or alter its SEO copy and 404 behavior as part of PR preview cleanup.
- If a build or publish fails before a page is available, the preview workflow must fail its live URL check and must not post a working-preview comment. The custom Pages 404 handles **missing URLs** after GitHub Pages itself is deployed, but does not make a failed build succeed or implement a server-side redirect.
- The fallback does not prove readiness. Only verified public SHA and `noindex` permit the **Preview ready** label; otherwise the tentative URL is clearly marked **publishing**.

## Maintenance rule: keep it simple

- Small documentation, README, agent rule and workflow-only fixes may be **committed directly to the appropriate branch** when explicitly authorized and permitted by branch protection. Do not open multiple redundant PRs for small workflow-only fixes.
- Changes to the `pull_request_target` workflow must be applied to **`main` first** (its execution source), then synchronized with `staging` to avoid reverting on future releases. Do not change the app, SEO text, GA4, production publishing or credentials as part of a small workflow fix.
- Use PR review/CI gates for feature work, sensitive permissions/security changes, or when branch policies require review.
- Never report **Preview ready** based only on a Git push or a Pages deployment trigger. If the single public SHA/`noindex` check fails, report **Preview publishing** with an explicit warning instead of waiting in a long polling loop.

Official references: [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [Publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [Security of pull_request_target](https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/).
