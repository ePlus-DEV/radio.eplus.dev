# GitHub Pages migration — private Nuxt source

The source remains PRIVATE: `ePlus-DEV/radio.eplus.dev`. Both publishing
repositories are PUBLIC and contain only generated HTML/JS/CSS/assets.

| Branch | Pages repository | URL | SEO |
| --- | --- | --- | --- |
| `develop` | `ePlus-DEV/ePlus-DEV.github.io` | https://eplus-dev.github.io/ | noindex; GA4 disabled |
| `main` | `ePlus-DEV/onair-production-pages` | https://radio.eplus.dev/ after production DNS cutover | sitemap, index and GA4 |

**Migration status:** Only prepare/test DEV at present. Keep production running
on DigitalOcean; do not update its DNS or enable `PAGES_PROD_READY` yet.

## One-time organization setup for DEV (GitHub Free)

1. **Rename the existing public DEV repository**
   `ePlus-DEV/onair-staging-pages` to **`ePlus-DEV.github.io`**
   from repository **Settings → General → Repository name → Rename**.
   This is necessary for the root URL `https://eplus-dev.github.io/`.
   GitHub organization Pages root sites require this exact repository naming.
   You can later add a custom DEV domain to the same repo without renaming it.
   The GitHub connector cannot rename a repository or configure Pages.
2. On the renamed repository, select **Settings → Pages → Deploy from a branch**,
   branch `main`, folder `/(root)`, then Save. Leave Custom domain empty
   while testing on the GitHub-provided URL.
3. Keep `PAGES_DEPLOY_TOKEN` in **the private source repository** under
   **Settings → Secrets and variables → Actions → Secrets**.
   Use a token with Contents read/write on the DEV and PROD public repos.
   A classic PAT with `public_repo` scope also works, but has broader access.
   When using a fine-grained PAT, check whether renaming the DEV repository
   requires reauthorizing its repository selection.
4. Under **source repository → Actions → Variables**, set
   `PAGES_DEV_READY=true` and `PAGES_PROD_READY=false`.
   Delete/unset `PAGES_DEV_SITE_URL` for the default GitHub-provided DEV URL,
   or set it explicitly to `https://eplus-dev.github.io`. Any older
   `https://new-radio.eplus.dev` value must be cleared before building,
   otherwise build metadata would point to the wrong site.
5. Merge the updated deployment workflow into `develop`; the push starts a
   deployment automatically. Alternatively, dispatch **Deploy ePlus OnAir to
   GitHub Pages** manually against branch `develop` after merge.
6. Monitor the source repository's Actions run and the public destination
   repository's GitHub Pages workflow. After both succeed, check
   https://eplus-dev.github.io/ from mobile and desktop: direct station URLs,
   refreshing detail pages, Play/Pause, navigation, responsive layout, assets,
   noindex, and no generated sitemap.

## What the workflow does

`.github/workflows/deploy-github-pages.yml` builds Nuxt from the private source,
runs unit tests and static output/SEO checks, then pushes **only**
`.output/public` to the correct public repository's `main` branch.
`.nojekyll` protects Nuxt's `_nuxt` assets on GitHub Pages.

For DEV using `eplus-dev.github.io`, `NUXT_PUBLIC_SITE_URL` defaults to
`https://eplus-dev.github.io` and `NUXT_PUBLIC_NO_INDEX=true`. There is no
`CNAME` file because the default GitHub domain is used. Production uses
`https://radio.eplus.dev` with a `CNAME` file.

Deployments are disabled by default through the Actions Variables:
`PAGES_DEV_READY` and `PAGES_PROD_READY`. Never give repository-write
credentials to untrusted pull requests. The default `GITHUB_TOKEN` of the
private source repository cannot push to different repositories.

## Later: optional custom DEV domain

When you want `new-radio.eplus.dev` (or another custom hostname), keep the
DEV repository named `ePlus-DEV.github.io`:

1. Verify ownership and add the hostname to the DEV repository's Pages settings.
2. Point the DNS subdomain CNAME to `eplus-dev.github.io`.
3. Set source Actions Variable
   `PAGES_DEV_SITE_URL=https://new-radio.eplus.dev`, and redeploy `develop`.
   The workflow writes the custom hostname into `CNAME`.

Do not change production's custom domain or DNS until the separate production
deployment is validated.

## Limits and rollback

GitHub Pages has a 1 GB published-site limit, a soft 100 GB/month bandwidth
limit, and a 10-minute deployment-time limit. Nuxt prerendering occurs in
GitHub Actions in the PRIVATE repo, consuming private-repo Actions minutes.
The workflow validates generated site size and indexability before publishing.

The DEV website is public, despite `noindex`. Never publish secrets, private
source files, `.env`, or source maps. `noindex` is not access control.

To roll back, restore a prior generated commit in the public Pages repository
or rerun a known-good source version. Keep DigitalOcean online until PROD
deployment, DNS and HTTPS have been confirmed.
