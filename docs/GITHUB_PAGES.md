# GitHub Pages deployment — private source, free organization

## Status

This is a **prepared migration**, not a live cutover. Do not shut down
DigitalOcean or update DNS until both public Pages targets have been created,
deployed, and verified. GitHub Free for organizations cannot publish Pages
directly from the existing private source repository.

The source stays private at `ePlus-DEV/radio.eplus.dev`. Only static output
from `npm run generate` is published to the public repositories.

| Source branch | Target (public repository) | Public site | Indexing |
| --- | --- | --- | --- |
| `develop` | `ePlus-DEV/onair-staging-pages` | A custom staging domain, e.g. https://new-radio.eplus.dev/ | noindex; GA4 disabled |
| `main` | `ePlus-DEV/onair-production-pages` | https://radio.eplus.dev/ (after DNS cutover) | index; GA4 production |

## One-time setup (organization owner)

1. Create **two PUBLIC, empty-website repositories**, initialize each with a
   README and set its default branch to `main`:
   - `ePlus-DEV/onair-staging-pages` (DEV project Pages, supports a custom domain).
   - `ePlus-DEV/onair-production-pages` (production project Pages).
   Do not copy the Nuxt source, credentials or `.env` into either repo.
2. On **both public repositories**, open **Settings → Pages → Build and deployment**.
   Select **Deploy from a branch**, branch `main`, folder `/(root)`, save.
   Organization policy must allow Public Pages publication.
3. Create a **fine-grained personal access token** authorized for organization
   `ePlus-DEV`, repository access restricted to **only** these two public
   repositories, with **Contents: Read and write**. Follow any organization
   approval prompts. Use a short expiration and renew before expiry.
4. Store the token as a repository Actions secret named `PAGES_DEPLOY_TOKEN`
   in the **private source** repository (Settings → Secrets and variables →
   Actions → New repository secret). Do not add it to a public repo or file.
   The default `GITHUB_TOKEN` is not authorized to push cross-repository.
5. Choose a **staging custom domain**, e.g. `new-radio.eplus.dev` (this is an
   example, not a required hostname). Verify ownership and configure that
   domain in the **DEV** repository Settings → Pages → Custom domain, before
   editing its DNS CNAME. In the private source repository, set Actions
   repository variable `PAGES_DEV_SITE_URL=https://<your-staging-domain>`
   without a path. Set `PAGES_DEV_READY=true` only after this is ready; keep
   `PAGES_PROD_READY` unset (or `false`). The workflow refuses to publish a
   staging site if its custom origin is missing or invalid.
6. Once the workflow is merged into `develop`, a push to `develop` builds
   the site and publishes only `.output/public` to the DEV repository.
   Inspect the workflow run and verify your configured DEV custom domain on PC and
   mobile: direct URL/reload of a station detail, radio Play/Pause, favorites,
   stream fallback, CSS, icons, country JSON, robots noindex, and absent sitemap.
7. Merge the workflow/release to `main`. Before production publishing, verify
   the custom domain is owned/verified in GitHub Pages settings and add
   `radio.eplus.dev` as custom domain on the production Pages repository.
   Do **not** change DNS yet. Set `PAGES_PROD_READY=true` only when ready.
   A push or manual dispatch on `main` uploads the production static output.
8. After checking build output, production SEO and site size, switch the DNS
   CNAME record for `radio.eplus.dev` to `eplus-dev.github.io` (the
   GitHub Pages organization hostname; this repository does not need to exist).
   Configure the DEV domain's DNS CNAME to the same organization hostname.
   Each custom domain must be assigned to the matching Pages repository.
   Ensure GitHub Pages recognizes the domain and HTTPS is provisioned before
   disabling DigitalOcean.

**Why not name the DEV repo `ePlus-DEV.github.io`?** The organization Pages
root URL is a special repo name and can be reserved for a future organization
site. A project repository such as `onair-staging-pages` can instead have a
separate custom root domain. Its default URL would be
`https://eplus-dev.github.io/onair-staging-pages/`, which requires Nuxt baseURL
and absolute-route changes. **This migration supports a configured DEV custom
domain only**; without one, leave `PAGES_DEV_READY` disabled. A subpath-based
fallback can be added in a separate change later.

## Automated workflow details

`.github/workflows/deploy-github-pages.yml` only runs after a trusted push to
`develop` or `main`, or manual dispatch from one of those branches.
There is no PR deployment with credentials. Each branch has its own concurrency
group, destination, site URL, and `noindex` flag. Both publishing jobs are
disabled until the corresponding `PAGES_*_READY` variable is enabled.

A successful build runs `npm test`, `npm run generate`, SEO/branding
checks, and `scripts/check-pages-build.mjs` to reject oversized bundles,
source maps, private dotfiles and incorrect indexing. The workflow copies
`.output/public` (not the source tree) to the correct public repository,
creates `.nojekyll` so GitHub serves the `_nuxt` assets, and writes a
`CNAME` file using the corresponding custom hostname for each Pages target.

The two output repositories have only generated assets, but all browser
JavaScript/HTML is public by design. Do not put tokens in `NUXT_PUBLIC_*`
environment variables. Never publish `.env` or source maps.

## Rollback and limitations

- **Rollback:** revert/restore a previous deployment commit on the relevant
  public Pages repository, or republish a previous trusted source commit. No
  source code changes are needed in the Pages repositories.
- GitHub Pages: **1 GB published site**, soft **100 GB/month** bandwidth,
  deployment time limit **10 minutes**. Static Nuxt generation runs in the
  private source Actions runner, and a project that outgrows GitHub Pages should
  be moved to a hosting/CDN service designed for larger assets.
- GitHub Free private repo Actions minutes are metered against plan quota.
  The static generation is relatively heavy (thousands of station pages/OG
  images); do not trigger unnecessary redeploys.
- The staging custom domain is **public** even though it uses
  `noindex`. Noindex is not authentication.
- GitHub repository/Page creation, settings, token setup and DNS ownership
  changes require administrator access through GitHub/the DNS provider; adding
  this workflow does **not** perform those operations.
