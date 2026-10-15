# ePlus OnAir

**Listen Beyond Borders.** Browse and listen to live radio stations worldwide.

**Website:** https://radio.eplus.dev · **Staging:** https://new-radio.eplus.dev

> [!IMPORTANT]
> This **public repository is the canonical source** for ePlus OnAir: Nuxt application, player, station catalog, tests, and release automation. The older `ePlus-DEV/get-radio` crawler is legacy history, not an active deployment source. Public Pages repositories hold generated artifacts, not application source.

## Repository and environment map

| Source branch | GitHub Environment | Public output repository | Configured hostname |
| --- | --- | --- | --- |
| `develop` | `development` | [onair-staging-pages](https://github.com/ePlus-DEV/onair-staging-pages) | https://new-radio.eplus.dev |
| `main` | `production` | [onair-production-pages](https://github.com/ePlus-DEV/onair-production-pages) | https://radio.eplus.dev |

- `develop` is the integration and staging branch. Open feature/bugfix PRs against it.
- `main` is the released source. Promote reviewed changes from `develop` through a release PR. Hotfixes start at `main` and must be brought back to `develop`.
- `master` is a legacy backup with separate history. Never reset, force-push, or deploy it as the current application.
- The destination repositories use their own `main` branches for the **static website output**; these are not the application source branch.
- The custom hostnames and DNS must be verified separately. A successful GitHub push alone does not prove the live DNS is served by Pages.

**SEO isolation:** `develop` staging is always `noindex`; `main` production builds are indexable (`index, follow`) with canonical URLs and a sitemap. Production-only GA4 (`G-ETDY41KBBJ`) is enabled on the canonical production hostname. Verify DNS and HTTPS separately from GitHub Pages deployment.

## Features

- Worldwide radio catalog organized by region, country, and station, with local flags and logos.
- Responsive Nuxt UI, light/dark mode, and seven localized interfaces.
- HTML5 Audio and HLS playback with play/pause, station navigation, favorites, and recently played.
- Station details, optional program/track information, search, and prerendered routes.
- Production-oriented metadata and sitemap support when the relevant environment is configured as indexable.

## Stack

Nuxt 4, Vue 3, TypeScript, Node.js 24.15.0, Tailwind CSS 4, Nuxt UI 4, Pinia, Nuxt i18n, hls.js, and optional Algolia. Versions and scripts are authoritative in [package.json](./package.json). DaisyUI has been replaced by Nuxt UI.

## Local development

Requires Node.js **24.15.0** and npm.

```bash
npm ci
# Configure a local .env with only the non-secret values you actually need.
npm run dev
```

Local URL: http://localhost:3000. Never commit credentials or copy example API tokens into a published README.

Common checks and builds:

```bash
npm test                 # Node unit and regression tests
npm run generate:site    # Pages-friendly static site (no per-station OG JPEG bundle)
npm run build            # Nuxt application build
npm run preview          # Preview built output
npm run test:ui          # Optional Playwright browser tests
```

`npm run generate` retains the complete local generation behavior and may generate station OG images; use `generate:site` for normal GitHub Pages publishing. CI browser tests are opt-in through `ENABLE_BROWSER_TESTS=true`.

## Source layout

| Path | Purpose |
| --- | --- |
| `pages/`, `components/`, `layouts/` | Nuxt routes and UI |
| `components/player/`, `stores/`, `utils/` | Player, persistence, station navigation |
| `public/radio/<area>/<country>.json` | Versioned country station catalogs |
| `public/img/` | Local country flags and station artwork |
| `lang/` | Localization dictionaries |
| `scripts/` and `build/` | Radio sync, prerender, media, SEO helpers |
| `tests/` | Automated regression checks |
| `.github/workflows/` | CI, Pages publishing, radio sync, station image publishing |

## Release and deployment

1. Merge reviewed changes into `develop`; use staging to verify navigation, streams, station metadata, and mobile layout.
2. Open a `develop` → `main` PR and require passing CI for the release. Do not force-push history.
3. Trusted pushes to `develop` publish only when `PAGES_DEV_READY=true`; trusted pushes to `main` run production publishing automatically with preflight validation.
4. The Pages job validates its exact destination repository, `NUXT_PUBLIC_SITE_URL`, and cross-repository write token before installing dependencies, then tests, generates and audits the static output.
5. The deployment updates `main` in the matching public Pages repository, re-creates `CNAME`, and **preserves its root `README.md`** during the destructive generated-site sync.
6. Confirm the Actions job succeeded and inspect the destination commit, deep-linked pages, images, and the configured custom hostname. Keep DNS/SEO cutover as an independent, reviewed task.

Required setup in the source repository (store all credentials as GitHub **Secrets**, never in code): GitHub Environments `development` / `production`, with `NUXT_PUBLIC_SITE_URL` set respectively to `https://new-radio.eplus.dev` / `https://radio.eplus.dev`; `PAGES_DEPLOY_TOKEN` must have scoped write access to both public Pages repositories. Do not expose this token to untrusted PR workflows.

All four workflows share a repository-wide concurrency queue. The workflows are:

| Workflow | Purpose |
| --- | --- |
| `build.yml` | PR unit/regression tests and conditional prerender/SEO validation |
| `deploy-github-pages.yml` | Trusted static site publication to staging/production Pages repositories |
| `instant-audio-sync.yml` | Manual radio catalog sync and contribution PR creation |
| `publish-station-images.yml` | Manual publication of station social JPEGs separately from website output |

See [deployment setup and cutover](./docs/GITHUB_PAGES.md) and [workflow policy](./docs/GITHUB_ACTIONS.md).

## Station social images and the GitHub Pages size limit

Normal Pages builds use `npm run generate:site` with `ONAIR_SKIP_STATION_OG=true`, retain in-catalog station artwork, and fall back to the shared brand preview for station Open Graph cards until a complete external image set is configured.

For individual station cards, dispatch **Publish station images separately**. It writes incremental JPEG batches (at most 100 MiB per push) to the separate `station-images` branch of the selected output repository. Once a complete manifest is published, set the Environment or repository variable `STATION_OG_BASE_URL` to the reported immutable URL and re-deploy the site.

Smaller pushes do **not** lift GitHub Pages' published-site 1 GB limit; keep the per-station JPEG collection outside the website artifact. See [separate-image release guide](./docs/SEPARATE_IMAGE_RELEASES.md).

## SEO and analytics

- The canonical production origin is `https://radio.eplus.dev`; staging uses `https://new-radio.eplus.dev` and must remain `noindex`.
- The `main` Pages production artifact is **indexable**, with canonical/structured data, sitemap and production-only GA4 (`G-ETDY41KBBJ`); `develop` Pages staging remains strictly `noindex`, without a sitemap or production GA4.
- `NUXT_PUBLIC_SITE_URL`, `NUXT_PUBLIC_NO_INDEX`, and `STATION_OG_BASE_URL` affect the generated static pages at build time.
- Do not configure the deprecated `radio-new.eplus.dev` or old `eplus-dev.github.io/onair-...` project paths as the current Pages origins.

See [SEO architecture](./docs/SEO.md).

## Security when working in this public repository

- **Never commit real values** to `.env.example`, code, tests, documentation or issue/PR comments. See [security policy](./SECURITY.md).
- Keep only browser-safe keys under `NUXT_PUBLIC_*`. Never include provider admin/write keys, Cloudinary secrets, DigitalOcean tokens or GitHub publishing tokens.
- Place deployment PATs in GitHub **Environment Secrets**, restrict them to the exact Pages output repositories and Contents write access, and require approval for the `production` environment where practical.
- Use read-only CI for untrusted fork pull requests. Do not make `pull_request_target` workflows checkout untrusted PR code and run it with secrets.
- A credential in Git history must be **revoked/rotated** even if removed from the latest commit; deleting a line does not undo exposure.

## Contribution and maintainership

Follow [CONTRIBUTING.md](./CONTRIBUTING.md), [AGENTS.md](./AGENTS.md), [project context](./docs/PROJECT_CONTEXT.md), and [radio synchronization notes](./docs/instant-audio-sync.md). Keep UI text translated, validate station streams and artwork paths, test changes, and avoid committing secrets.

**License:** No open-source license has been selected yet. Public visibility alone does not grant reuse or redistribution rights. Before accepting code contributions or advertising this as open source, choose and add a LICENSE (for example MIT or Apache-2.0 after checking third-party assets and dependencies).
