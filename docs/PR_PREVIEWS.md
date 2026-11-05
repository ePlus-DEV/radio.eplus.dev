# GitHub Pages: visual preview for each pull request

## Architecture

Full production and staging deployments are unchanged:

- `main` -> `ePlus-DEV/onair-production-pages` -> `https://radio.eplus.dev`
- `develop` -> `ePlus-DEV/onair-staging-pages` -> `https://new-radio.eplus.dev`
- **feature PR targeting `develop`** -> dedicated `ePlus-DEV/onair-pr-previews` Pages repository -> `https://eplus-dev.github.io/onair-pr-previews/pr-preview/pr-<number>/`

Do not put previews inside the staging or production output repository. As of 2026-11-05, the staging Pages `main` tree already contains ~962.8 MB of files, close to GitHub Pages' 1 GB published-site limit.

## One-time setup required (repository owner)

1. Create a **PUBLIC** GitHub repository named `ePlus-DEV/onair-pr-previews`. Initialize it with a README and an initial `main` branch. Do not use a name containing `.github.io`; it is a project Pages site. Do not create a `CNAME` file.
2. In that repo's **Settings -> Pages**, set **Build and deployment -> Source: Deploy from a branch**, `main` / `/(root)`. Use its GitHub default hostname, not the production or staging custom domain.
3. Ensure the existing **fine-grained `PAGES_DEPLOY_TOKEN`** already grants `Contents: Read and write` to *this new output repo*, in addition to its existing staging/production repositories. This token belongs to the source repository's **development Environment Secret**. Do not put it in an ordinary PR build job, project files or comments.
4. The workflow reuses **existing** `PAGES_DEV_READY=true` (already used by staging). **No new feature flag or token is required.** Merge the PR Preview feature into `develop`; no production deployment changes are needed. Do **not** fast-track changes to `main`.

The source repo's `.github/workflows/pr-preview-pages.yml` creates and updates an individual directory for each PR, and removes the directory when its PR is closed or merged. The workflow posts/updates a **single** link comment on each PR. Its GitHub Pages link includes a project path and a PR path.

A different Pages origin/custom-domain or repo name requires updating **all** matching base URLs and path assertions in the workflow and `utils/pr-preview.mjs`; do not set a custom domain without adjusting those paths.

## Security model

- The workflow uses `pull_request_target` so its **workflow definition comes from the trusted target branch**, but **the untrusted checkout and npm build run in a separate read-only job, with `persist-credentials: false` and no deploy secrets or Environment access**.
- Only same-repository PRs targeting `develop` are built; fork PRs and bot synchronization branches are excluded.
- The trusted publication job downloads the static artifact and **never executes scripts from the PR or checks out its code**. It rechecks current PR state/base/head SHA before publishing. A closed or updated PR cannot publish an obsolete commit.
- The existing `PAGES_DEPLOY_TOKEN` is reused for authenticated Git clone/push of `ePlus-DEV/onair-pr-previews`. It never changes the source `develop`/`main` branches or other Pages output repos.
- Branch-independent build settings force `NUXT_PUBLIC_NO_INDEX=true`, no production GA4, no sitemap, `ONAIR_SKIP_STATION_OG=true`, and per-PR base URLs. Production SEO content, titles, canonical policy and GA4 settings stay unchanged.
- Closed PR cleanup is independent of the build and only removes `pr-preview/pr-<number>/` after checking that the PR is still closed. Reopening the PR creates a new preview.
- The preview website is public. Do not place secrets or private test datasets in preview pages.

## Deliberately light builds

One full static catalog per open PR would exceed GitHub Pages' **1 GB published-site limit**. Therefore only a representative set of pages is prerendered, via `ONAIR_PR_PREVIEW=true`:

- Homepage and `/asia` discovery.
- Vietnam country page and `/asia/viet-nam/vov-gt-hcm` station deep link.
- Library, Settings, Statistics and static informational pages.

The normal `main` and `develop` site-generation routes remain **completely unchanged**. The preview still contains Nuxt static assets, public radio JSON catalogs and artwork, but **unprerendered detail routes may not load on direct refresh**. Use staging after merge for whole-catalog and complete SEO testing; do not mistake partial static preview for an E2E production equivalent.

Build gate checks run existing unit tests, `assert-staging-noindex`, `assert-ga4-output`, `check-pages-build` plus `assert-pr-preview-output`. Publication also rejects absent station/home HTML, invalid subpaths, production GA4, symlinks, and an aggregate public output of 900 MB or more.

## Manual smoke check after initial setup

1. Open a small PR against `develop` from a branch in `ePlus-DEV/radio.eplus.dev`.
2. Check GitHub Actions **PR Preview — GitHub Pages**: read-only build, then trusted publish.
3. Follow the comment link; verify homepage (dark/light), mobile navigation, player, library and the Vietnam station deep link.
4. Verify HTML has `noindex`, no production GA4 and that CSS, JS, logo, favicon, images and station JSON load under the PR path. Note that GitHub Pages branch publishing may take additional time after the commit.
5. Push a second commit; confirm the **same** link is updated. Close the PR; confirm its directory disappears from the Pages output repository.

If the action fails before publish: ensure the new Pages repository has a `main` branch, the token has **Contents write** to that exact repo, the `development` Environment permits the job, and the already configured `PAGES_DEV_READY` is enabled. If a build becomes too large, add only necessary representative routes rather than copying all 4,000+ station pages into each PR.

Official references: [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [Publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [Security of pull_request_target](https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/).
