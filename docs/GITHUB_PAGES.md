# ePlus OnAir — GitHub Pages custom-domain deployment

The private source stays at `ePlus-DEV/radio.eplus.dev`. Static build output is
published only to the two **existing** public repositories. Never rename them,
create an organization-root Pages repository or modify DigitalOcean/DNS via CI.

| Source branch | GitHub Environment | Pages output repo | Custom domain |
| --- | --- | --- | --- |
| `develop` | `development` | `ePlus-DEV/onair-staging-pages` | `https://new-radio.eplus.dev` |
| `main` | `production` | `ePlus-DEV/onair-production-pages` | `https://radio.eplus.dev` |

Both use `NUXT_APP_BASE_URL=/` because each Pages repo has its **own hostname**.
Do not use `/onair-staging-pages/` or `/onair-production-pages/` in any
generated CSS, JS, image, audio catalog or internal link.

## Configure the two scoped variables

In the **private source repository**: Settings → Environments.

- Environment **`development`** → Environment variable:
  `NUXT_PUBLIC_SITE_URL=https://new-radio.eplus.dev`
- Environment **`production`** → Environment variable:
  `NUXT_PUBLIC_SITE_URL=https://radio.eplus.dev`

The variables have the **same name** but belong to different Environments.
They must not be two duplicate repository-level variables.

Under Settings → Secrets and variables → Actions, retain the **repository**
secret `PAGES_DEPLOY_TOKEN` with Contents: Read/write on the two public output
repositories, and the **repository** opt-in variables:

- `PAGES_DEV_READY=true` for authorized pushes/manual deploys of `develop`.
- `PAGES_PROD_READY=false` by default; only enable for an explicitly approved
  `main` publication when the revised workflow actually exists on `main`.

Do not give `PAGES_DEPLOY_TOKEN` to pull request jobs. If a GitHub Environment
has deployment branch restrictions or required reviewers, configure them to
match the intended source branch and approvals.

## GitHub Pages / DNS

Each public output repository: Settings → Pages → Deploy from branch →
`main` → `/(root)`. Custom domains:

- `onair-staging-pages`: `new-radio.eplus.dev`
- `onair-production-pages`: `radio.eplus.dev`

For a subdomain, the DNS CNAME points to `eplus-dev.github.io` **without any
repository pathname**. Do not change an existing `radio.eplus.dev` DigitalOcean
DNS record as part of a workflow/PR change. Cut over only after an explicit
production migration decision and verified content/HTTPS readiness. Enable
**Enforce HTTPS** once GitHub's certificate is ready.

The publishing workflow writes the appropriate root `CNAME` **after** the
`rsync --delete` step, so later deploys cannot accidentally drop the GitHub
Pages custom-domain binding. A pre-build check validates the Environment URL
against the expected domain, before installing npm packages or generating
thousands of pages.

## Deploy order and SEO safeguards

1. Merge reviewed workflow/script changes to `develop`. A workflow-only
   merge does **not** auto-run the expensive deploy (push path filters remain).
2. Manually dispatch **Deploy ePlus OnAir to GitHub Pages** on `develop` when
   the `development` Environment variable and `PAGES_DEV_READY` are ready.
3. Check GitHub Actions, Pages publish state and `https://new-radio.eplus.dev`:
   homepage, a deep-linked station after refresh, CSS/JS, radio JSON, flags,
   favicon, play/pause, mobile navigation and `robots.txt`.
4. Only after validating staging, promote the reviewed workflow changes to
   `main` in a **separate** approved release. The source `main` branch does
   not inherit a new `develop` workflow automatically.
5. Treat `PAGES_PROD_READY` as a manual opt-in. Do not silently merge to
   `main`, change DNS, terminate DigitalOcean or enable search indexing.

**Both output repositories intentionally remain `noindex`** during this
custom-domain setup, including the PRO preview. The current production
site may already be serving `radio.eplus.dev` elsewhere, so do not interpret
the `production` Environment name alone as permission to enable indexing.
Before canonical production cutover, separately assess sitemap, robots,
GA4 measurement `G-ETDY41KBBJ`, production OG images and GitHub Pages' 1 GB
output-size limit; switch `NUXT_PUBLIC_NO_INDEX` off only in a deliberate
reviewed production release.

The isolated legacy branch
`deploy/pages-production-preview-20261012` still contains a separate
one-shot workflow configured for old project Pages paths and **must not be
rerun** against custom-domain output repos until it is updated or retired.
This PR updates the common deploy workflow on `develop`, not that isolated
branch. Its previous completed run does not auto-update the static website
for the new root URLs.

Manual deployment guide:
- Verify both GitHub Environments and the opt-in variable on the private repo.
- Verify each Pages output repository has its expected `CNAME`.
- Merge the config PR to `develop`, manually run the develop deploy, inspect
  output assets/SEO, and only then plan production release.
