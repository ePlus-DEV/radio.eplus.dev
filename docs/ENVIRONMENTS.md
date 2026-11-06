# ePlus OnAir — Three-environment deployment contract

This is the authoritative environment and release map. It applies to the source repository `ePlus-DEV/radio.eplus.dev` and its three **separate** public GitHub Pages output repositories.

| Tier | Source / trigger | GitHub Environment | Pages repository | Public URL | Search / analytics |
| --- | --- | --- | --- | --- | --- |
| **Production** | Trusted `main` push or manual dispatch on `main` | `production` | `ePlus-DEV/onair-production-pages` | `https://radio.eplus.dev/` | Indexable; canonical, JSON-LD, sitemap, production GA4 |
| **Staging** | Trusted `develop` push or manual dispatch on `develop` | `staging` after migration | `ePlus-DEV/onair-staging-pages` | `https://stg.radio.eplus.dev/` | `noindex`; no sitemap, canonical/JSON-LD or production GA4 |
| **Development (PR Preview)** | Same-repo feature/bugfix PR opened, reopened or updated with base `develop` | `preview` (after migration; trusted config, publisher and cleanup only) | `ePlus-DEV/onair-pr-previews` | `https://preview.radio.eplus.dev/pr-preview/pr-<number>/` | `noindex`; no sitemap, canonical/JSON-LD or production GA4 |

**No long-lived `dev` source branch or root-host deployment is implied.** The development tier is intentionally one isolated, temporary build **per PR** on the preview host. `https://preview.radio.eplus.dev/` is the preview landing page, not a fourth build. A permanent `dev` branch would require a separate reviewed hosting, capacity and promotion design.

## Promotion and isolation

1. Develop on a feature branch and open a PR against `develop`. Only a trusted publisher can write `pr-preview/pr-<number>/`; the untrusted PR build has read-only permissions and no deployment secret.
2. Confirm preview code, UI, mobile, route assets and the expected head SHA at its exact `/pr-preview/pr-<number>/` URL. Successful artifact upload or git push alone does not prove live availability.
3. Merge into `develop` after CI; a trusted push publishes the **full** staging site to `stg.radio.eplus.dev`. Staging is an integration environment and must not share Preview's PR-specific base path.
4. Create and review a `develop` → `main` **release PR**. Only the reviewed merge to `main` publishes Production. Never force-push or automatically merge a PR merely to deploy.
5. Production is the only indexable/GA4-enabled host. Staging and Development share a *policy*, not deployment repositories or secrets. Do not modify existing production SEO copy, canonical or GA4 identifiers to implement tier separation.

## GitHub Environments and safe migration

Historically, the staging deployment used the GitHub Environment named `development` and shared the repository-level `PAGES_DEV_READY` gate with Preview. The new target state is **three GitHub Environments** with separate configuration:

- `production`: `NUXT_PUBLIC_SITE_URL=https://radio.eplus.dev`; `PAGES_DEPLOY_TOKEN` scoped to `onair-production-pages`. Restrict deployment to `main` and use reviewers for high-risk releases.
- `staging`: `NUXT_PUBLIC_SITE_URL=https://stg.radio.eplus.dev`; a `PAGES_DEPLOY_TOKEN` scoped to `onair-staging-pages`. Copy approved public environment variables, such as `NUXT_PUBLIC_CORS_SERVER_1`, `NUXT_PUBLIC_GLOBAL_RADIO_RESOLVER_URL` and `STATION_OG_BASE_URL`, if used. Restrict deployment to `develop`.
- `preview`: its own Preview publishing/cleanup `PAGES_DEPLOY_TOKEN` with Contents write access **only to `ePlus-DEV/onair-pr-previews`**, plus optional public `NUXT_PUBLIC_SITE_NAME=ePlus OnAir — Preview`, CORS and resolver variables. The URL is **derived per PR**, never a shared `NUXT_PUBLIC_SITE_URL` Environment value. PR build jobs do not receive Environment secrets. Create this Environment before setting repository-level `PAGES_PREVIEW_READY=true`.

**Migration is deliberately two-phase:**

1. In the source repository's Settings → Environments, create/configure `staging` with its **own** `PAGES_DEPLOY_TOKEN` Environment Secret and the correct `NUXT_PUBLIC_SITE_URL` Environment Variable. Confirm output repository write access and approved optional public vars. Do not copy secret values into docs or PR comments.
2. Once ready, set the source repository-level GitHub Actions Variable **`PAGES_STAGING_READY=true`**. The `develop` deployment now selects `staging` instead of `development`, and its independent staging gate is enabled. Verify staging preflight and live deployment before retiring legacy staging variables from `development`.

Until that repository-level variable exists, `develop` continues using the **legacy `development` Environment** and `PAGES_DEV_READY=true` gate, avoiding an unconfigured Environment breaking Staging. Setting `PAGES_STAGING_READY=false` explicitly disables staging; it does **not** silently revert to the legacy Environment. Preview migrates separately: when `PAGES_PREVIEW_READY=true`, trusted Preview jobs use the dedicated `preview` Environment; if the new variable is absent, the old `development` Environment and `PAGES_DEV_READY=true` remain a legacy fallback. Setting `PAGES_PREVIEW_READY=false` disables Preview without fallback. `main` production is never gated by either readiness variable.

The connected GitHub file tools do not provision GitHub Environment secrets/variables. The repository owner must carry out the two settings changes above before the three-Environments state is fully activated.

## Build boundaries and verification

| Check | Production | Staging | Development PR Preview |
| --- | --- | --- | --- |
| Base path | `/` | `/` | `/pr-preview/pr-N/` |
| Build `NUXT_PUBLIC_SITE_URL` | Production root URL | Staging root URL | Preview URL including PR path |
| Site title (default) | `ePlus OnAir` | `ePlus OnAir — Staging` | `ePlus OnAir — Preview` |
| Title override | `NUXT_PUBLIC_SITE_NAME` in `production` | `NUXT_PUBLIC_SITE_NAME` in `staging` | `NUXT_PUBLIC_SITE_NAME` in `preview` (trusted public output to untrusted build) |
| `NUXT_PUBLIC_NO_INDEX` | `false` | `true` | `true` |
| Sitemap, canonical, JSON-LD | Yes | No | No |
| GA4 `G-ETDY41KBBJ` | Yes | No | No |
| Pages repository | Production only | Staging only | Preview only; per-PR directories |
| Deployment credentials | Trusted release job | Trusted release job | Trusted publisher/cleanup only |

- Production/staging builds use `scripts/assert-ga4-output.mjs` and `scripts/check-pages-build.mjs` with their own tier arguments. Preview must pass those checks with `development` (not masquerade as `staging`) plus `scripts/assert-pr-preview-output.mjs`.
- `.github/workflows/pr-preview-pages.yml` uses `pull_request_target`, so its trusted definition must be synchronized on the default branch `main` **and** `develop`; the checked-out PR content must never run in a job with deployment secrets.
- Preserve `CNAME`, `.nojekyll` and the root fallback/README of each output repository. Cleaning up a closed PR may remove **only** its `pr-preview/pr-N/` folder.
- Preview is intentionally a small static sample under the GitHub Pages 1 GB limit; unprerendered deep links may show the root Preview 404 countdown, then redirect to the matching Production route. **A 404 redirect does not count as a working Preview**. The bot must verify a live 200, `noindex` and the current PR SHA before posting a link.
- Check HTTPS/DNS for all domains independently. No automatic DNS or GitHub Environment secret management is performed by code changes.

Also see [PR Preview runbook](./PR_PREVIEWS.md), [Pages deployment guide](./GITHUB_PAGES.md), [workflow policy](./GITHUB_ACTIONS.md) and [SEO policy](./SEO.md).

## Staging custom-domain migration: new-radio → stg.radio (2026-11-06)

The selected Staging domain (to be activated after DNS/Pages cutover) is **`https://stg.radio.eplus.dev/`**. The previous `https://new-radio.eplus.dev/` remains a legacy hostname for rollback/transition; it is **not** the new Pages custom domain. Do not remove it from the application's `noindex` host safeguards until migration and any old links are retired. Production and PR Preview domains are unchanged.

**Complete this checklist before merging a code change that switches the staging deploy target.** The deploy workflow deliberately validates an *exact* Staging hostname; enabling it before DNS and GitHub Pages are ready can stop the next staging publish, although existing static files remain in the output repository.

1. **DNS:** In the DNS provider for `eplus.dev`, add `stg.radio` as a `CNAME` to `eplus-dev.github.io` (the Pages GitHub origin), following GitHub Pages guidance and checking for an existing conflicting record. If Cloudflare is used, use **DNS only** (not proxied) for the initial GitHub Pages custom-domain/HTTPS verification. Leave the existing `new-radio` record in place for rollback until cutover is confirmed.
2. **GitHub Environment:** Ensure `ePlus-DEV/radio.eplus.dev` → Settings → Environments → `staging` has its own `PAGES_DEPLOY_TOKEN` secret with write access to `ePlus-DEV/onair-staging-pages`, and change `NUXT_PUBLIC_SITE_URL` to **`https://stg.radio.eplus.dev`**. Copy only separately approved public settings for `NUXT_PUBLIC_CORS_SERVER_1`, `NUXT_PUBLIC_GLOBAL_RADIO_RESOLVER_URL` and `STATION_OG_BASE_URL`. Do not expose token values in code or logs.
3. **Backend CORS:** Update the external CORS proxy and any approved stream resolver to allow the exact origin `https://stg.radio.eplus.dev`. Keep the old origin permitted temporarily if needed. Test TuneIn and HLS playback in both Chrome and Safari; the Nuxt build cannot update third-party CORS allowlists.
4. **GitHub Pages binding:** The output repository `ePlus-DEV/onair-staging-pages` already has a root `CNAME` file containing **`stg.radio.eplus.dev`** (verified 2026-11-06, changed independently of this PR). Verify **Settings → Pages → Custom Domain** is also `stg.radio.eplus.dev`, DNS check is passing and HTTPS is enabled. A correct `CNAME` file alone does **not** prove the Pages binding or certificate is active. GitHub Pages allows a single custom hostname per repository; plan for the old hostname to stop serving or arrange an independent redirect.
5. **Deploy cutover:** After the Staging Environment and Pages custom domain are ready, set the repository-level Actions Variable `PAGES_STAGING_READY=true` (if not already enabled), merge the reviewed domain update into `develop`, then run the trusted Staging deploy (or `workflow_dispatch` on `develop`). It validates `TARGET_DOMAIN=stg.radio.eplus.dev`, `NUXT_PUBLIC_SITE_URL`, repository access and output before publishing and writes the new `CNAME` automatically.
6. **Verify live:** Test `https://stg.radio.eplus.dev/`, deep links, CSS/JS assets, HTTPS certificate, `noindex`, absence of production GA4 and sitemap, and actual station playback/CORS in the browser. **Do not** rely solely on a successful GitHub Action or CNAME commit as proof of live HTTPS. Production `radio.eplus.dev` and Development `preview.radio.eplus.dev/pr-preview/pr-N/` must remain unchanged.
7. **Clean up:** Only after confirmation, consider a 301/308 redirect from `new-radio.eplus.dev` to the new domain via your DNS/CDN host (DNS alone does not issue HTTP redirects). Keep the legacy hostname in the `noindex` safeguard. Restore the previous Pages custom domain, Environment variable and trusted deploy configuration together if a rollback is required; changing only one component can leave the site unavailable.

The DNS provider, GitHub Pages Settings and GitHub Environment Secrets/Variables cannot be changed by the source-code PR alone. The separate output repo's root `CNAME` is already set to `stg.radio.eplus.dev`, but live DNS and the actual Pages custom-domain binding remain unverified. Code review and CI must finish before cutover. This repository contains no Cloudflare secrets or DNS automation.

## Dedicated Preview Environment and title configuration (2026-11-06)

The target set of **three independently configured GitHub Environments** is `production`, `staging`, and `preview`. The `development` Environment is **legacy only** while the safe Staging and Preview migrations are being completed. A Preview is a *per-PR build*, not an additional permanent `dev` source branch.

1. In `ePlus-DEV/radio.eplus.dev` → Settings → Environments, create **`preview`** and store a Preview-only `PAGES_DEPLOY_TOKEN` Environment Secret. It must have write permission to `ePlus-DEV/onair-pr-previews` and must not reuse Production/Staging deployment credentials. Add approved *public* variables `NUXT_PUBLIC_SITE_NAME=ePlus OnAir — Preview`, `NUXT_PUBLIC_CORS_SERVER_1`, and `NUXT_PUBLIC_GLOBAL_RADIO_RESOLVER_URL` as needed. Do not configure a shared site origin: each PR builds its own exact `preview.radio.eplus.dev/pr-preview/pr-N/` path.
2. Keep `production` and `staging` isolated. Use their own Environment variable `NUXT_PUBLIC_SITE_NAME` (defaults: `ePlus OnAir` and `ePlus OnAir — Staging`). The variable controls the **browser/SSR title suffix** and site name only, **not** Production route-specific SEO titles, descriptions, structured data or GA4. Recognized nonproduction hostnames default to the correct title even if the variable is absent.
3. **Deploy the trusted `pull_request_target` workflow update on the default `main` branch**, then set the **repository-level** variable `PAGES_PREVIEW_READY=true`. That switches only the trusted Preview config/publish/cleanup jobs to the new `preview` Environment. PR code still runs in a credential-free build job; the trusted config passes through validated public values, including the title. Synchronize the workflow definition with `develop`.
4. While `PAGES_PREVIEW_READY` is **unset**, Preview retains the old `development` Environment and `PAGES_DEV_READY=true` gate, so existing previews keep publishing until the new secret is provisioned. Setting `PAGES_PREVIEW_READY=false` explicitly disables Preview without falling back. **Do not delete `development` secrets/config** until both Preview and Staging no longer need their respective legacy fallbacks.
5. Open a new PR against `develop` and verify Preview's title, `noindex`, no production GA4, asset subpaths, its live PR SHA marker and cleanup-on-close. Check `stg.radio.eplus.dev` and `radio.eplus.dev` titles separately, without rewriting their page copy.

GitHub Environments and Actions Variables/Secrets need owner-side configuration; changing workflow YAML alone cannot provision or migrate stored credentials. Keep `PAGES_PREVIEW_READY` and `PAGES_STAGING_READY` independent.
