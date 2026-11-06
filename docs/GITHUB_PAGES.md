# ePlus OnAir — GitHub Pages deployment

ePlus OnAir application code lives in the **private** repository `ePlus-DEV/radio.eplus.dev`. Website output is published to **three isolated public** GitHub Pages repositories:

| Source branch | Environment | Output repository | Custom hostname |
| --- | --- | --- | --- |
| Feature PR → `develop` | `development` (trusted Preview jobs) | `ePlus-DEV/onair-pr-previews` | `https://preview.radio.eplus.dev/pr-preview/pr-N/` |
| `develop` | `staging` (after migration) | `ePlus-DEV/onair-staging-pages` | `https://new-radio.eplus.dev` |
| `main` | `production` | `ePlus-DEV/onair-production-pages` | `https://radio.eplus.dev` |

Production and Staging use root `NUXT_APP_BASE_URL=/`. Development Preview uses `NUXT_APP_BASE_URL=/pr-preview/pr-N/`. Never generate legacy `/onair-*-pages/` GitHub project paths. Keep the public repos as generated output only, rather than editing static HTML by hand.

## Required GitHub settings

Configure the *source repository* GitHub Environments:

- `development` → trusted PR Preview config/publish/cleanup, `PAGES_DEV_READY=true` at repository level; its public site URL is derived dynamically per PR.
- `staging` → `NUXT_PUBLIC_SITE_URL=https://new-radio.eplus.dev`, its own `PAGES_DEPLOY_TOKEN` Environment Secret, and repository-level `PAGES_STAGING_READY=true` **only after** secrets and variables are set.
- `production` → `NUXT_PUBLIC_SITE_URL=https://radio.eplus.dev` with the existing production Environment secret.

The scoped `PAGES_DEPLOY_TOKEN` Environment Secret needs Contents read/write permission **only for the exact Pages output repo used by that tier**. Development Preview build jobs have **no** deployment secret. Before `staging` has been provisioned and `PAGES_STAGING_READY=true` set at the repository level, the staging job temporarily retains its legacy `development` Environment/`PAGES_DEV_READY=true` behavior. A deliberate `PAGES_STAGING_READY=false` disables Staging instead of falling back. Production is not gated by either variable. Complete [the migration checklist](./ENVIRONMENTS.md) before retiring legacy config.

All three output repositories should use Settings → Pages → Deploy from branch `main` at `/(root)` with their corresponding custom domain and HTTPS. Preserve root `CNAME` records. DNS configuration and production traffic cutover are separate operational steps; they are not changed by this workflow.

## Trusted release steps

1. Develop changes on feature branches and verify isolated `/pr-preview/pr-N/` Development Previews after CI.
2. Merge into `develop`, then verify full Staging at `new-radio.eplus.dev` (using the dedicated `staging` Environment after migration).
3. Promote reviewed `develop` into `main` via a separate release PR, without force pushing.
4. The Pages workflow checks exact repository/domain, source SHA freshness, Environment URL and token write permissions before the expensive build.
5. The job runs tests, generates `npm run generate:site`, audits station metadata and the Pages size limit, then syncs the resulting static site to the matching public repository.
6. Confirm the Actions run and destination commit. Test the homepage, deep links, artwork, radio JSON, player, mobile layout and TLS.

All workflows share the `onair-repository-work` queue. Older queued source commits can be skipped if superseded, avoiding obsolete releases.

### Preserve repository documentation

The publish step uses `rsync --delete` for generated files but protects the root `README.md` in each public output repository. This file is repository documentation, not application content. The workflow recreates `CNAME` after syncing so the domain binding is retained.

## SEO and station preview images

**The build policies differ by tier:** Development Preview and `develop` Staging are always `noindex`, have no canonical/JSON-LD/sitemap, and never run production GA4. `main` is **indexable** (`index, follow`) and publishes canonical tags, structured data, a production sitemap and GA4 (`G-ETDY41KBBJ`). The Pages deploy gate uses the matching `production` / `staging` audit, so a production `noindex` artifact fails before publishing. Verify production DNS/TLS separately; pushing code does not itself change DNS.

Website builds exclude per-station Open Graph JPEG files to remain below the Pages site size limit. Use **Publish station images separately** to upload reusable JPEGs incrementally to the public repository's `station-images` branch (up to 100 MiB per push). Only set `STATION_OG_BASE_URL` after the complete manifest is available; otherwise keep the shared brand social image. See [SEPARATE_IMAGE_RELEASES.md](./SEPARATE_IMAGE_RELEASES.md).

## Troubleshooting

- **Job skipped on `develop`:** check repository-level `PAGES_STAGING_READY`; if absent, staging still uses the legacy `PAGES_DEV_READY` gate and `development` Environment. Verify the new `staging` Environment before enabling the new variable.
- **Job stopped at preflight:** check `NUXT_PUBLIC_SITE_URL`, `PAGES_DEPLOY_TOKEN`, branch protection and output repository permissions.
- **Generated output exceeds 1 GB:** ensure `generate:site` and `ONAIR_SKIP_STATION_OG=true`; do not bundle station JPEGs into Pages.
- **Pages URL differs from configured hostname:** verify public repository `CNAME`, Pages settings, TLS and DNS; don't assume a successful Git push verifies live routing.
- **README disappeared:** confirm the sync command retains `--exclude='/README.md'`.
