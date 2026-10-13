# ePlus OnAir — GitHub Pages deployment

ePlus OnAir application code lives in the **private** repository `ePlus-DEV/radio.eplus.dev`. Website output is published to two **public** GitHub Pages repositories:

| Source branch | Environment | Output repository | Custom hostname |
| --- | --- | --- | --- |
| `develop` | `development` | `ePlus-DEV/onair-staging-pages` | `https://new-radio.eplus.dev` |
| `main` | `production` | `ePlus-DEV/onair-production-pages` | `https://radio.eplus.dev` |

Both use root `NUXT_APP_BASE_URL=/`; never generate legacy `/onair-staging-pages/` or `/onair-production-pages/` project paths. Keep the public repos as generated output only, rather than editing static HTML by hand.

## Required GitHub settings

Configure the *source repository* GitHub Environments:

- `development` → `NUXT_PUBLIC_SITE_URL=https://new-radio.eplus.dev`
- `production` → `NUXT_PUBLIC_SITE_URL=https://radio.eplus.dev`

The repository-scoped `PAGES_DEPLOY_TOKEN` secret needs Contents read/write permission for **both** output repositories; it is used only by trusted deployment jobs, not untrusted pull requests. `PAGES_DEV_READY=true` enables `develop` publishing. Production publishing is **not** gated by a `PAGES_PROD_READY` variable: trusted `main` pushes execute after preflight succeeds.

Each output repository should use Settings → Pages → Deploy from branch `main` at `/(root)` with its matching custom domain and HTTPS. DNS configuration and production traffic cutover are separate operational steps; they are not changed by this workflow.

## Trusted release steps

1. Develop changes on feature branches and merge into `develop` after CI.
2. Verify staging with the `development` Environment enabled.
3. Promote reviewed `develop` into `main` via a separate PR, without force pushing.
4. The Pages workflow checks exact repository/domain, source SHA freshness, Environment URL and token write permissions before the expensive build.
5. The job runs tests, generates `npm run generate:site`, audits station metadata and the Pages size limit, then syncs the resulting static site to the matching public repository.
6. Confirm the Actions run and destination commit. Test the homepage, deep links, artwork, radio JSON, player, mobile layout and TLS.

All workflows share the `onair-repository-work` queue. Older queued source commits can be skipped if superseded, avoiding obsolete releases.

### Preserve repository documentation

The publish step uses `rsync --delete` for generated files but protects the root `README.md` in each public output repository. This file is repository documentation, not application content. The workflow recreates `CNAME` after syncing so the domain binding is retained.

## SEO and station preview images

Both Pages outputs intentionally contain page-level `noindex` until a **separate** approved production SEO/DNS cutover. Neither a `main` merge nor a successful Pages publish authorizes enabling indexing. Recheck production sitemap, canonical, robots, GA4 production gating and DNS before that decision.

Website builds exclude per-station Open Graph JPEG files to remain below the Pages site size limit. Use **Publish station images separately** to upload reusable JPEGs incrementally to the public repository's `station-images` branch (up to 100 MiB per push). Only set `STATION_OG_BASE_URL` after the complete manifest is available; otherwise keep the shared brand social image. See [SEPARATE_IMAGE_RELEASES.md](./SEPARATE_IMAGE_RELEASES.md).

## Troubleshooting

- **Job skipped on `develop`:** check `PAGES_DEV_READY` and Environment configuration.
- **Job stopped at preflight:** check `NUXT_PUBLIC_SITE_URL`, `PAGES_DEPLOY_TOKEN`, branch protection and output repository permissions.
- **Generated output exceeds 1 GB:** ensure `generate:site` and `ONAIR_SKIP_STATION_OG=true`; do not bundle station JPEGs into Pages.
- **Pages URL differs from configured hostname:** verify public repository `CNAME`, Pages settings, TLS and DNS; don't assume a successful Git push verifies live routing.
- **README disappeared:** confirm the sync command retains `--exclude='/README.md'`.
