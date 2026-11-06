# ePlus OnAir — Three-environment deployment contract

This is the authoritative environment and release map. It applies to the source repository `ePlus-DEV/radio.eplus.dev` and its three **separate** public GitHub Pages output repositories.

| Tier | Source / trigger | GitHub Environment | Pages repository | Public URL | Search / analytics |
| --- | --- | --- | --- | --- | --- |
| **Production** | Trusted `main` push or manual dispatch on `main` | `production` | `ePlus-DEV/onair-production-pages` | `https://radio.eplus.dev/` | Indexable; canonical, JSON-LD, sitemap, production GA4 |
| **Staging** | Trusted `develop` push or manual dispatch on `develop` | `staging` after migration | `ePlus-DEV/onair-staging-pages` | `https://new-radio.eplus.dev/` | `noindex`; no sitemap, canonical/JSON-LD or production GA4 |
| **Development (PR Preview)** | Same-repo feature/bugfix PR opened, reopened or updated with base `develop` | `preview` (after safe migration; trusted config, publisher and cleanup only) | `ePlus-DEV/onair-pr-previews` | `https://preview.radio.eplus.dev/pr-preview/pr-<number>/` | `noindex`; no sitemap, canonical/JSON-LD or production GA4 |

**No long-lived `dev` source branch or root-host deployment is implied.** The development tier is intentionally one isolated, temporary build **per PR** on the preview host. `https://preview.radio.eplus.dev/` is the preview landing page, not a fourth build. A permanent `dev` branch would require a separate reviewed hosting, capacity and promotion design.

## Promotion and isolation

1. Develop on a feature branch and open a PR against `develop`. Only a trusted publisher can write `pr-preview/pr-<number>/`; the untrusted PR build has read-only permissions and no deployment secret.
2. Confirm preview code, UI, mobile, route assets and the expected head SHA at its exact `/pr-preview/pr-<number>/` URL. Successful artifact upload or git push alone does not prove live availability.
3. Merge into `develop` after CI; a trusted push publishes the **full** staging site to `new-radio.eplus.dev`. Staging is an integration environment and must not share Preview's PR-specific base path.
4. Create and review a `develop` → `main` **release PR**. Only the reviewed merge to `main` publishes Production. Never force-push or automatically merge a PR merely to deploy.
5. Production is the only indexable/GA4-enabled host. Staging and Development share a *policy*, not deployment repositories or secrets. Do not modify existing production SEO copy, canonical or GA4 identifiers to implement tier separation.

## GitHub Environments and safe migration

Historically, the staging deployment used the GitHub Environment named `development` and shared the repository-level `PAGES_DEV_READY` gate with Preview. The new target state is **three GitHub Environments** with separate configuration:

- `production`: `NUXT_PUBLIC_SITE_URL=https://radio.eplus.dev`; `PAGES_DEPLOY_TOKEN` scoped to `onair-production-pages`. Restrict deployment to `main` and use reviewers for high-risk releases.
- `staging`: `NUXT_PUBLIC_SITE_URL=https://new-radio.eplus.dev`; a `PAGES_DEPLOY_TOKEN` scoped to `onair-staging-pages`. Copy approved public environment variables, such as `NUXT_PUBLIC_CORS_SERVER_1`, `NUXT_PUBLIC_GLOBAL_RADIO_RESOLVER_URL` and `STATION_OG_BASE_URL`, if used. Restrict deployment to `develop`.
- `preview`: separate Preview-only `PAGES_DEPLOY_TOKEN` with Contents write permission only to `onair-pr-previews`, and approved public `NUXT_PUBLIC_SITE_NAME`, CORS and resolver variables. The public Preview URL is derived per PR; the untrusted build receives **no Environment secrets**. Set `PAGES_PREVIEW_READY=true` only after provisioning.

**Migration is deliberately two-phase:**

1. In the source repository's Settings → Environments, create/configure `staging` with its **own** `PAGES_DEPLOY_TOKEN` Environment Secret and the correct `NUXT_PUBLIC_SITE_URL` Environment Variable. Confirm output repository write access and approved optional public vars. Do not copy secret values into docs or PR comments.
2. Once ready, set the source repository-level GitHub Actions Variable **`PAGES_STAGING_READY=true`**. The `develop` deployment now selects `staging` instead of `development`, and its independent staging gate is enabled. Verify staging preflight and live deployment before retiring legacy staging variables from `development`.

Until that repository-level variable exists, `develop` continues using the **legacy `development` Environment** and `PAGES_DEV_READY=true` gate, avoiding an unconfigured Environment breaking Staging. Setting `PAGES_STAGING_READY=false` explicitly disables staging; it does **not** silently revert to the legacy Environment. Preview migrates independently: `PAGES_PREVIEW_READY=true` selects the trusted `preview` Environment. If this variable is absent, the legacy `development` Environment and `PAGES_DEV_READY` remain active. Explicit `PAGES_PREVIEW_READY=false` disables Preview without fallback. `main` production is never gated by either readiness variable.

The connected GitHub file tools do not provision GitHub Environment secrets/variables. The repository owner must carry out the two settings changes above before the three-Environments state is fully activated.

## Build boundaries and verification

| Check | Production | Staging | Development PR Preview |
| --- | --- | --- | --- |
| Base path | `/` | `/` | `/pr-preview/pr-N/` |
| Build `NUXT_PUBLIC_SITE_URL` | Production root URL | Staging root URL | Preview URL including PR path |
| Default browser-tab/site name | `ePlus OnAir` | `ePlus OnAir — Staging` | `ePlus OnAir — Preview` |
| Override | `production`'s `NUXT_PUBLIC_SITE_NAME` | `staging`'s `NUXT_PUBLIC_SITE_NAME` | `preview`'s validated `NUXT_PUBLIC_SITE_NAME` |
| `NUXT_PUBLIC_NO_INDEX` | `false` | `true` | `true` |
| Sitemap, canonical, JSON-LD | Yes | No | No |
| GA4 `G-ETDY41KBBJ` | Yes | No | No |
| Pages repository | Production only | Staging only | Preview only; per-PR directories |
| Deployment credentials | Trusted release job | Trusted release job | Trusted publisher/cleanup only |

- Production/staging builds use `scripts/assert-ga4-output.mjs` and `scripts/check-pages-build.mjs` with their own tier arguments. Preview must pass those checks with `development` (not masquerade as `staging`) plus `scripts/assert-pr-preview-output.mjs`.
- `.github/workflows/pr-preview-pages.yml` uses `pull_request_target`, so its trusted definition must be synchronized on the default branch `main` **and** `develop`; the checked-out PR content must never run in a job with deployment secrets.
- Preserve `CNAME`, `.nojekyll` and the root fallback/README of each output repository. Cleaning up a closed PR may remove **only** its `pr-preview/pr-N/` folder.
- Preview is intentionally a small static sample under the GitHub Pages 1 GB limit; unprerendered deep links may show the root Preview 404 countdown, then redirect to the matching Production route. **A 404 redirect does not count as a working Preview**. The metadata-only status job must hide any older Preview hyperlink immediately on PR open/reopen/synchronize, and mark it unavailable on failure or expired on close. The bot must verify live HTTP 200, `noindex`, current PR SHA and matching workflow run ID before restoring a Preview link.
- Check HTTPS/DNS for all domains independently. No automatic DNS or GitHub Environment secret management is performed by code changes.

Also see [PR Preview runbook](./PR_PREVIEWS.md), [Pages deployment guide](./GITHUB_PAGES.md), [workflow policy](./GITHUB_ACTIONS.md) and [SEO policy](./SEO.md).

## Separate Preview GitHub Environment and title configuration (2026-11-06)

The intended three independent GitHub Environments are `production`, `staging` and `preview`. The old `development` Environment is a **transitional fallback** while migration is unfinished, not a fourth destination. A Preview is created **per PR**, without a permanent `dev` branch.

1. Create GitHub Environment **`preview`** in the source repository, with a **separate** `PAGES_DEPLOY_TOKEN` Environment Secret scoped to `ePlus-DEV/onair-pr-previews`. Set approved public Environment variables including `NUXT_PUBLIC_SITE_NAME=ePlus OnAir — Preview`, CORS and resolver only when needed. Its per-PR URL comes from the workflow; never hardcode a shared origin in the Preview Environment.
2. Keep `staging` and `production` separately configured. The browser-tab title suffix/site name comes from each Environment's `NUXT_PUBLIC_SITE_NAME`, defaulting to `ePlus OnAir — Staging` and `ePlus OnAir`. The helper distinguishes recognized hostnames when values are absent. The title change **does not rewrite Production SEO route title text, description, canonical, structured data or GA4**.
3. Because `.github/workflows/pr-preview-pages.yml` uses `pull_request_target`, merge its trusted definition into default **`main`** and synchronize to `develop`. After the new Preview secret is provisioned, set **repository-level** `PAGES_PREVIEW_READY=true`. Trusted Preview config/publish/cleanup jobs then use `preview`, but the untrusted PR build remains without Environment secrets and receives only validated public variables.
4. When `PAGES_PREVIEW_READY` is absent, the workflow continues using the old `development` Environment with `PAGES_DEV_READY=true` to avoid interrupting active previews. Explicit `PAGES_PREVIEW_READY=false` disables Preview without fallback. Do not remove `development` secrets before both Preview and Staging have been migrated away from their respective legacy fallbacks.
5. Validate per-PR Preview title, indexability, actual published commit marker, assets and cleanup-on-close. Verify that Production remains indexed and uses GA4, while Staging/Preview are `noindex` and GA4-free.

Secrets and GitHub Environment settings are owner-managed: the repository workflow cannot create/migrate them automatically. The existing CLI output validator argument `development` is the *build policy* name, not the GitHub Environment name `preview`.
