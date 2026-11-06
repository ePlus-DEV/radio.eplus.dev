# ePlus OnAir — GitHub Pages deployment

ePlus OnAir application code lives in the **private** repository `ePlus-DEV/radio.eplus.dev`. Website output is published to **three isolated public** GitHub Pages repositories:

| Source branch | Environment | Output repository | Custom hostname |
| --- | --- | --- | --- |
| Feature PR → `staging` | `preview` (trusted jobs after migration) | `ePlus-DEV/onair-pr-previews` | `https://preview.radio.eplus.dev/pr-preview/pr-N/` |
| `staging` | `staging` (after migration) | `ePlus-DEV/onair-staging-pages` | `https://stg.radio.eplus.dev` |
| `main` | `production` | `ePlus-DEV/onair-production-pages` | `https://radio.eplus.dev` |

Production and Staging use root `NUXT_APP_BASE_URL=/`. Development Preview uses `NUXT_APP_BASE_URL=/pr-preview/pr-N/`. Never generate legacy `/onair-*-pages/` GitHub project paths. Keep the public repos as generated output only, rather than editing static HTML by hand.

## Required GitHub settings

Configure the *source repository* GitHub Environments:

- `preview` → trusted PR Preview config/publish/cleanup, its own `PAGES_DEPLOY_TOKEN` (write only to `onair-pr-previews`) and optional `NUXT_PUBLIC_SITE_NAME=ePlus OnAir — Preview`. Set repository-level `PAGES_PREVIEW_READY=true` only **after** provisioning; the public site URL is derived dynamically per PR.
- `staging` → `NUXT_PUBLIC_SITE_URL=https://stg.radio.eplus.dev`, its own `PAGES_DEPLOY_TOKEN` Environment Secret, and repository-level `PAGES_STAGING_READY=true` **only after** secrets and variables are set.
- `production` → `NUXT_PUBLIC_SITE_URL=https://radio.eplus.dev`, optional `NUXT_PUBLIC_SITE_NAME=ePlus OnAir`, and existing production Environment secret. Staging may set `NUXT_PUBLIC_SITE_NAME=ePlus OnAir — Staging` independently.

The scoped `PAGES_DEPLOY_TOKEN` Environment Secret needs Contents read/write permission **only for the exact Pages output repo used by that tier**. Development Preview build jobs have **no** deployment secret. Before `staging` has been provisioned and `PAGES_STAGING_READY=true` set at the repository level, the staging job temporarily retains its legacy `development` Environment/`PAGES_DEV_READY=true` behavior. A deliberate `PAGES_STAGING_READY=false` disables Staging instead of falling back. The Preview workflow uses `PAGES_DEV_READY` and `development` only as a legacy fallback while `PAGES_PREVIEW_READY` is absent; `PAGES_PREVIEW_READY=false` disables Preview. Production is not gated by these variables. Complete [the migration checklist](./ENVIRONMENTS.md) before retiring legacy config.

All three output repositories should use Settings → Pages → Deploy from branch `main` at `/(root)` with their corresponding custom domain and HTTPS. Preserve root `CNAME` records. DNS configuration and production traffic cutover are separate operational steps; they are not changed by this workflow.

## Trusted release steps

1. Develop changes on feature branches and verify isolated `/pr-preview/pr-N/` Development Previews after CI.
2. Merge into `staging`, then verify full Staging at `stg.radio.eplus.dev` (using the dedicated `staging` Environment after migration).
3. Promote reviewed `staging` into `main` via a separate release PR, without force pushing.
4. The Pages workflow checks exact repository/domain, source SHA freshness, Environment URL and token write permissions before the expensive build.
5. The job runs tests, generates `npm run generate:site`, audits station metadata and the Pages size limit, then syncs the resulting static site to the matching public repository.
6. Confirm the Actions run and destination commit. Test the homepage, deep links, artwork, radio JSON, player, mobile layout and TLS.

All workflows share the `onair-repository-work` queue. Older queued source commits can be skipped if superseded, avoiding obsolete releases.

### Preserve repository documentation

The publish step uses `rsync --delete` for generated files but protects the root `README.md` in each public output repository. This file is repository documentation, not application content. The workflow recreates `CNAME` after syncing so the domain binding is retained.

## SEO and station preview images

**The build policies differ by tier:** Development Preview and `staging` Staging are always `noindex`, have no canonical/JSON-LD/sitemap, and never run production GA4. `main` is **indexable** (`index, follow`) and publishes canonical tags, structured data, a production sitemap and GA4 (`G-ETDY41KBBJ`). The Pages deploy gate uses the matching `production` / `staging` audit, so a production `noindex` artifact fails before publishing. Verify production DNS/TLS separately; pushing code does not itself change DNS.

Website builds exclude per-station Open Graph JPEG files to remain below the Pages site size limit and use the shared brand social image by default. The unused manual station-image publishing workflow has been retired. Local image generation is still available with `npm run generate:images`; **do not** set `STATION_OG_BASE_URL` unless a complete immutable external image set and valid manifest have been independently published and verified. See [SEPARATE_IMAGE_RELEASES.md](./SEPARATE_IMAGE_RELEASES.md).

## Troubleshooting

- **Job skipped on `staging`:** check repository-level `PAGES_STAGING_READY`; if absent, staging still uses the legacy `PAGES_DEV_READY` gate and `development` Environment. Verify the new `staging` Environment before enabling the new variable.
- **Job stopped at preflight:** check `NUXT_PUBLIC_SITE_URL`, `PAGES_DEPLOY_TOKEN`, branch protection and output repository permissions.
- **Generated output exceeds 1 GB:** ensure `generate:site` and `ONAIR_SKIP_STATION_OG=true`; do not bundle station JPEGs into Pages.
- **Pages URL differs from configured hostname:** verify public repository `CNAME`, Pages settings, TLS and DNS; don't assume a successful Git push verifies live routing.
- **README disappeared:** confirm the sync command retains `--exclude='/README.md'`.
