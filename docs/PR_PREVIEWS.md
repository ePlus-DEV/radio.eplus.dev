# GitHub Pages: visual preview for each pull request

## Architecture

Three environments are kept isolated; Development is a temporary PR Preview tier, not a permanent `dev` source branch. Production and Staging remain full-site deployments. See [ENVIRONMENTS.md](./ENVIRONMENTS.md).

- `main` -> `ePlus-DEV/onair-production-pages` -> `https://radio.eplus.dev`
- `develop` -> `ePlus-DEV/onair-staging-pages` -> `https://new-radio.eplus.dev`
- **Development feature PR targeting `develop`** -> GitHub Environment `preview` (trusted jobs after safe migration) -> dedicated `ePlus-DEV/onair-pr-previews` Pages repository -> `https://preview.radio.eplus.dev/pr-preview/pr-<number>/`

Do not put previews inside the staging or production output repository. As of 2026-11-05, the staging Pages `main` tree already contains ~962.8 MB of files, close to GitHub Pages' 1 GB published-site limit.

## One-time setup required (repository owner)

1. Create a **PUBLIC** GitHub repository named `ePlus-DEV/onair-pr-previews`. Initialize it with a README and an initial `main` branch. Do not use a name containing `.github.io`; it is a project Pages site. The existing root `CNAME` file must contain exactly `preview.radio.eplus.dev`.
2. In that repo's **Settings -> Pages**, set **Build and deployment -> Source: Deploy from a branch**, `main` / `/(root)`. Set **Custom domain: `preview.radio.eplus.dev`** in Pages Settings, with a Cloudflare DNS-only CNAME `preview.radio` -> `eplus-dev.github.io`, and enable **Enforce HTTPS** once the certificate is ready. Keep Pages publishing from `main` / `/(root)`.
3. Ensure the existing **fine-grained `PAGES_DEPLOY_TOKEN`** already grants `Contents: Read and write` to *this new output repo*, in addition to its existing staging/production repositories. Use a separate token in the source repository's **preview Environment Secret**; the old `development` token remains available only during safe migration. Do not put it in an ordinary PR build job, project files or comments.
4. The workflow selects a dedicated **Preview** Environment with repository-level `PAGES_PREVIEW_READY=true` after owner-side provisioning. While the new flag is absent, it retains the previous `development`/`PAGES_DEV_READY=true` fallback. Staging migrates independently to `PAGES_STAGING_READY=true` (repository variable) after its own `staging` GitHub Environment is provisioned. The output repository and domain stay the same; the GitHub Environment and scoped credentials are separated. Keep `.github/workflows/pr-preview-pages.yml` on **both `main` (GitHub default branch) and `develop`**: the `pull_request_target` workflow is loaded from `main` but only targets PRs against `develop`. No application or production deployment changes are required.

The source repo's `.github/workflows/pr-preview-pages.yml` creates and updates an individual directory for each qualifying PR, and removes the directory when its PR is closed or merged. Opening/reopening/updating a same-repository feature PR targeting `develop` triggers the preview; **merging into `develop` does not trigger a preview for that merge**. The workflow posts/updates a **single** bot comment only **after** the public Pages URL serves the expected PR commit SHA from `preview-commit.txt` and returns a successful HTML response with `noindex`. Its GitHub Pages link includes only the PR path under the custom domain, without the legacy `/onair-pr-previews/` prefix.

The custom domain is configured in the output repo and the source workflow uses `NUXT_APP_BASE_URL=/pr-preview/pr-<number>/`. Keep `utils/pr-preview.mjs`, `scripts/assert-pr-preview-output.mjs` and the publisher's path assertions in sync; changing DNS alone leaves stale Nuxt asset paths.

## Security model

- The workflow uses `pull_request_target`: its **trusted workflow definition must come from the GitHub default branch `main`**, while the trigger's `branches: [develop]` filters the PR base branch. Keep the same workflow file on both `main` and `develop`. **The untrusted checkout and npm build run in a separate read-only job**, with `persist-credentials: false`, no deploy secrets and no Environment access.
- Only same-repository PRs targeting `develop` are built; fork PRs and bot synchronization branches are excluded.
- The trusted publication job downloads the static artifact and **never executes scripts from the PR or checks out its code**. It rechecks current PR state/base/head SHA before publishing. A closed or updated PR cannot publish an obsolete commit.
- The Preview Environment's dedicated scoped `PAGES_DEPLOY_TOKEN` authenticates Git clone/push of `ePlus-DEV/onair-pr-previews`. It never changes the source `develop`/`main` branches or other Pages output repos.
- The trusted `preview` config job validates `NUXT_PUBLIC_SITE_NAME` and forwards its public value to the credential-free PR build; default tab title is `ePlus OnAir — Preview`. Production and Staging titles come from their own Environment variables.
- Branch-independent build settings force `NUXT_PUBLIC_NO_INDEX=true`, no production GA4, no sitemap, `ONAIR_SKIP_STATION_OG=true`, and per-PR base URLs. Production SEO content, titles, canonical policy and GA4 settings stay unchanged.
- Closed PR cleanup is independent of the build and only removes `pr-preview/pr-<number>/` after checking that the PR is still closed. Reopening the PR creates a new preview.
- The preview website is public. Do not place secrets or private test datasets in preview pages.

## Deliberately light builds

One full static catalog per open PR would exceed GitHub Pages' **1 GB published-site limit**. Therefore only a representative set of pages is prerendered, via `ONAIR_PR_PREVIEW=true`:

- Homepage and `/asia` discovery.
- Vietnam country page and `/asia/viet-nam/vov-gt-hcm` station deep link.
- Library, Settings, Statistics and static informational pages.

The full-site `main` Production and `develop` Staging route sets remain **completely unchanged** by Development Preview build limits. The preview still contains Nuxt static assets, public radio JSON catalogs and artwork, but **unprerendered detail routes may not load on direct refresh**. Use staging after merge for whole-catalog and complete SEO testing; do not mistake partial static preview for an E2E production equivalent.

Build gate checks run existing unit tests, `assert-staging-noindex`, `assert-ga4-output` (**development** target), `check-pages-build` (**development** target) plus `assert-pr-preview-output`. Publication also rejects absent station/home HTML, invalid subpaths, production GA4, symlinks, and an aggregate public output of 900 MB or more.

## Manual smoke check after initial setup

1. Open a small PR against `develop` from a branch in `ePlus-DEV/radio.eplus.dev`.
2. Check GitHub Actions **PR Preview — GitHub Pages**: read-only build, then trusted publish.
3. The bot must post the link **only after the URL really responds with a successful `noindex` HTML page and the current PR head SHA marker**; then verify homepage (dark/light), mobile navigation, player, library and the Vietnam station deep link. If the link shows GitHub Pages 404, this is a failed verification, even if build/push/deployment checks were green.
4. Verify HTML has `noindex`, no production GA4 and that CSS, JS, logo, favicon, images and station JSON load under the PR path. Note that GitHub Pages branch publishing may take additional time after the commit.
5. Push a second commit; confirm the **same** link is updated only after the current commit is publicly served. **Close the smoke-test PR without merging**; confirm its directory disappears from the Pages output repository. PR [#367](https://github.com/ePlus-DEV/radio.eplus.dev/pull/367) is the earlier closed/unmerged smoke test.

If the action fails before publish: ensure the new Pages repository has a `main` branch, the token has **Contents write** to that exact repo, the `preview` Environment permits the job with `PAGES_PREVIEW_READY=true` (or legacy `development`/`PAGES_DEV_READY` only while unset). If a build becomes too large, add only necessary representative routes rather than copying all 4,000+ station pages into each PR.

## Expired, missing, or failed preview links

The **output repository** `ePlus-DEV/onair-pr-previews` has a root-level `404.html`, separate from Nuxt's per-preview `404.html`. Missing/unprerendered and expired preview URLs use a **5-second visible countdown**, with a manual "Open live page now" link, before a client-side redirect to the **matching production route**. For example, `/pr-preview/pr-375/global-radio/apple-music/` redirects to `https://radio.eplus.dev/global-radio/apple-music/` and preserves the query string and fragment. Unknown/non-PR routes fall back to `https://radio.eplus.dev/`. GitHub Pages still serves HTTP **404** (not 301/302); do not report the countdown as server-side redirect or a successful preview build.

- Keep the root `CNAME`, `404.html`, `index.html`, `.nojekyll` and `README.md` when publishing or deleting any individual PR's preview.
- Never write fallback/redirect logic into the production site or alter its SEO copy and 404 behavior as part of PR preview cleanup.
- If a build or publish fails before a page is available, the preview workflow must fail its live URL check and must not post a working-preview comment. The custom Pages 404 handles **missing URLs** after GitHub Pages itself is deployed, but does not make a failed build succeed or implement a server-side redirect.
- This fallback does not replace live-link verification before the bot posts or updates its comment.

## Maintenance rule: keep it simple

- Small documentation, README, agent rule and workflow-only fixes may be **committed directly to the appropriate branch** when explicitly authorized and permitted by branch protection. Do not open multiple redundant PRs for small workflow-only fixes.
- Changes to the `pull_request_target` workflow must be applied to **`main` first** (its execution source), then synchronized with `develop` to avoid reverting on future releases. Do not change the app, SEO text, GA4, production publishing or credentials as part of a small workflow fix.
- Use PR review/CI gates for feature work, sensitive permissions/security changes, or when branch policies require review.
- Never report a live preview based solely on successful Git commits or successful GitHub Pages deployment; verify public HTTP delivery and the expected head SHA. A failed live check must prevent the bot's "Open Preview" link.

Official references: [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [Publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [Security of pull_request_target](https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/).
