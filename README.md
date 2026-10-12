> [!IMPORTANT]
> **Canonical / active repository**
>
> ePlus OnAir — Listen Beyond Borders. The public URL remains `https://radio.eplus.dev` during this rebrand.
> Use this repository for the radio UI/player, station data, sync tooling, tests, and deployment work.
>
> **Do not use `ePlus-DEV/get-radio` for new work.** That repository is a legacy PHP crawler kept only for historical reference and is not part of the current production flow.

# ePlus OnAir

**Listen Beyond Borders.**

ePlus OnAir is a Nuxt-based internet radio application for browsing and listening to live radio stations from around the world.

**Website:** https://radio.eplus.dev

## Branches and deployment environments

| Branch | Environment / purpose | URL |
| --- | --- | --- |
| `develop` | Development and staging; integrate and test changes before release | https://radio-new.eplus.dev (current DigitalOcean); your custom DEV domain (planned Pages repository: `onair-staging-pages`) |
| `main` | Production; stable, released application (repository default branch) | https://radio.eplus.dev |
| `master` | Legacy backup of the previous version; do not deploy or use for new development | — |
| `feature/*` | Short-lived feature/fix branches, normally created from `develop` | PR into `develop` |
| `hotfix/*` | Urgent production fixes, branched from `main` | PR into `main`, then sync to `develop` |

**Release flow:** `feature/*` → `develop` (staging) → `main` (production).

1. Create a feature branch from `develop` and open a PR targeting `develop`.
2. Run unit tests, prerender and browser regression tests; verify the staging deployment on `radio-new.eplus.dev`.
3. Open a promotion PR from `develop` to `main`. Review changes, ensure required CI checks pass and merge only when ready to release.
4. Deploy `main` to `radio.eplus.dev`; create a version tag on `main` for traceability and rollback.
5. For urgent production hotfixes, branch from `main`, validate/release via PR, then merge or cherry-pick the fix back into `develop`.

**Legacy backup:** Keep `master` intact as the previous-version snapshot. Do not merge `develop` or `main` into `master`, reset it, force-push it or delete it as part of the new release workflow. `master` has a separate history from `main`.

**GitHub Pages migration (not live yet):** [Migration, setup, deployment and rollback guide](./docs/GITHUB_PAGES.md). The source remains private. The public Pages destinations require separate public repositories and a scoped cross-repo deployment credential. Do not switch the production DNS or remove DigitalOcean before verification.

**Deployment configuration:** This table defines the intended branch-to-domain policy. Hosting/CD settings (including any DigitalOcean app source branch) must be configured to match it; modifying Git branches or this README alone does not change deployed websites. Set `NUXT_PUBLIC_SITE_URL` for each environment and validate production canonical URLs and sitemap before release.

## Highlights

- Live internet radio directory grouped by region and country.
- Current repository metadata contains **87 country entries** across North America, Central America, South America, Europe, Africa, Asia, and Oceania.
- Multilingual UI: English, Vietnamese, Japanese, Simplified Chinese, Traditional Chinese, French, and Russian.
- Station favorites, search, theme support, and responsive UI.
- SEO-friendly prerendered radio routes and sitemap generation.
- Local country flags and station artwork under `public/img/`.
- Country and station data stored as version-controlled JSON.

## Tech stack

- Nuxt 4
- Vue 3
- Node.js 24
- Tailwind CSS
- Nuxt UI 4 (DaisyUI removed)
- Pinia
- Native HTML5 Audio + hls.js
- Nuxt i18n
- Nuxt Image
- Algolia
- Font Awesome

The exact dependency versions are defined in `package.json`.

> [!TIP]
> **Maintainer / AI context**
>
> Before changing the UI, player, theme, radio data, or sync logic, read:
>
> - [`AGENTS.md`](./AGENTS.md) — short, enforceable rules for coding agents and contributors.
> - [`docs/PROJECT_CONTEXT.md`](./docs/PROJECT_CONTEXT.md) — architecture decisions, known regressions, debugging notes, and project history that should survive individual PRs/chats.
> - [`docs/instant-audio-sync.md`](./docs/instant-audio-sync.md) — radio-data sync behavior and safety model.
> - [`docs/SEO.md`](./docs/SEO.md) — SEO architecture, indexability rules, structured-data coverage, and known blockers.
>
> These files are the durable project memory. Update them whenever a change introduces a new architectural rule, important workaround, provider limitation, or debugging lesson.

## Project structure

```text
radio.eplus.dev/
├─ components/                 # Vue components
├─ pages/                      # Application routes
├─ stores/                     # Pinia stores
├─ lang/                       # Translation files
├─ public/
│  ├─ radio/
│  │  ├─ world.json            # World/country radio metadata
│  │  └─ <area>/<country>.json # Station data by country
│  └─ img/
│     ├─ <area>/flags/         # Country flags
│     └─ <area>/<country>/     # Local station artwork
├─ data/
│  └─ world.ts                 # Generated world metadata
├─ scripts/                    # Data maintenance/sync scripts
├─ build/                      # Build and SEO helpers
└─ nuxt.config.ts
```

A station entry generally looks like:

```json
{
  "station-slug": {
    "title": "Station name",
    "type": "audio/mpeg",
    "url": "https://station.example",
    "cros": false,
    "stream": "https://stream.example/live.mp3",
    "features": "/img/europe/example/station-slug.png",
    "favorite": false
  }
}
```

## Local development

### Requirements

- Node.js `24.15.0`
- npm

### Install

```bash
npm install
```

Copy the environment template and fill only the values required for your environment:

```bash
cp .env.example .env
```

Do not commit private API keys, access tokens, or deployment credentials.

### Start the development server

```bash
npm run dev
```

The application is available at:

```text
http://localhost:3000
```

## Build

Run the UI regression suite against generated output:

```bash
npm test
npm run generate
npx playwright install chromium
npm run test:ui
```

Browser checks are temporarily optional. CI runs them only when the repository
variable `ENABLE_BROWSER_TESTS` is `true`; unit tests, generation and staging
noindex checks remain enabled.

The browser suite uses local audio fixtures and intercepted providers. It checks
persistent MP3/HLS playback, station navigation, cancellation, language/theme
menus, and a 320px layout without depending on live streams.

Create a production build:

```bash
npm run build
```

Generate the prerendered application:

```bash
npm run generate
```

Preview the production build locally:

```bash
npm run preview
```

## Radio data

Country metadata is defined in:

```text
public/radio/world.json
```

Station data is stored per country:

```text
public/radio/<area>/<country>.json
```

Examples:

```text
public/radio/asia/viet-nam.json
public/radio/europe/belgium.json
```

Country flags:

```text
public/img/<area>/flags/<country>.<ext>
```

Station artwork:

```text
public/img/<area>/<country>/<station>.<ext>
```

When adding or updating radio data, prefer local artwork paths so the application does not depend unnecessarily on third-party hotlinks.

## Internationalization

Translation files are stored in `lang/`.

Currently configured locales:

| Code | Language |
| --- | --- |
| `en` | English |
| `vi` | Tiếng Việt |
| `ja` | 日本語 |
| `zh-CN` | 简体中文 |
| `zh-TW` | 繁體中文 |
| `fr` | Français |
| `ru` | Русский |

### Translation quality checks

All user-facing text must use Nuxt i18n, including labels, accessibility text, empty states and SEO metadata. Keep translations in all seven `lang/*.json` files in sync. Use natural, context-aware wording rather than literal translations (for example, Git *commit*, player *source* and song *lyrics*).

New translation keys must preserve the same structure, nonempty values and `{variable}` placeholders in every locale. The `tests/i18n-translation-quality.test.mjs` suite checks these invariants. Run `npm test` before opening a PR into `develop`.

## Search

Algolia integration is optional during build and local development. When Algolia credentials are not configured, the application can still build without them.

### Incremental station Open Graph thumbnails

During `npm run generate`, `scripts/generate-station-og-images.mjs` creates the static
1200×630 JPEGs referenced by each station's `og:image`. It also publishes an
`/og/stations/manifest.json` manifest of SHA-256 source fingerprints and rendered
JPEG hashes. No generated JPEGs or manifest are committed to Git.

- **Unchanged title, country, source logo bytes and renderer:** reuse a validated
  local JPEG, or download the exact unchanged JPEG from the previously deployed
  static site. This avoids expensive Sharp rendering on later deployments.
- **Changed title/logo or updated renderer:** render only the affected station's
  JPEG. Changes to rendering functions invalidate their fingerprints.
- **Fresh deploy / unavailable CDN / invalid cached JPEG:** render normally.
  A missing cache never causes missing share thumbnails or build failures.
- **Deleted stations:** no longer appear in a clean deployment's catalog/output.
- **Staging vs production:** the cache uses `NUXT_PUBLIC_SITE_URL` to read the
  corresponding environment's *previous live deployment* via HTTPS.
  Optionally set `OG_IMAGE_CACHE_BASE_URL` to another trusted public static
  origin serving the same manifest and images. Do not point staging to production
  for previews with unpublished changes.
- The first build after enabling caching necessarily generates the collection.
  Subsequent builds print `generated`, `reusedLocal`, `reusedRemote` and
  `remoteFailures` counts, making savings and fallback behavior visible.
  Static builds still ship a complete set of assets, so cross-deployment reuse
  downloads unchanged JPEGs (~192 MB total for 4,227 stations); it saves render
  CPU and duration but not artifact size or all network transfer.

Keep `NUXT_PUBLIC_SITE_URL` configured correctly at **build time** on DigitalOcean.
The `scripts/assert-all-station-social-meta.mjs` CI gate still checks the final
HTML and image dimensions for every station regardless of cache hits.

## SEO

ePlus OnAir prerenders the radio route hierarchy, exposes server-rendered country/station links, generates structured data, and includes catalog-backed routes in the sitemap. The canonical production site URL defaults to:

```text
https://radio.eplus.dev
```

Override it using `NUXT_PUBLIC_SITE_URL` when needed.

See [`docs/SEO.md`](./docs/SEO.md) for the current SEO implementation and known limitations, including the current no-prefix i18n/hreflang limitation.

Public site pages also include `/about`, `/statistics`, `/contact`, `/privacy-policy`, and `/terms-of-use`. They are prerendered and included in the sitemap.

### Staging: noindex (develop)

The `develop` deployment at **https://radio-new.eplus.dev** is **not indexed**. If the additional `new-radio.eplus.dev` preview hostname is used, configure its actual deployment, DNS and `NUXT_PUBLIC_SITE_URL` consistently; the source code accepts both hostnames as staging for noindex purposes.
It retains functioning prerendered radio pages but does not render SEO canonical,
or JSON-LD; Open Graph/Twitter previews remain available for link-sharing tests. Its `robots.txt` allows crawlers to read
`noindex` without advertising a sitemap. The sitemap module is disabled.
Production `main` stays indexable.

**Set these build-time environment variables in the staging host:**

```env
NUXT_PUBLIC_SITE_URL=https://radio-new.eplus.dev
NUXT_PUBLIC_NO_INDEX=true
```

For production, keep `NUXT_PUBLIC_SITE_URL=https://radio.eplus.dev` and leave
`NUXT_PUBLIC_NO_INDEX` unset/false. No custom `NUXT_DEPLOY_ENV` or branch
detection is needed; the staging hostname also triggers noindex as a safeguard.
Set the two staging variables **at build time**, because this site is statically
generated. Never turn on noindex unconditionally in shared source, or
production would inherit it on promotion.

Verify the staging HTML source includes `<meta name="robots" content="noindex, nofollow, noarchive">`,
has no canonical/JSON-LD but has explicit social preview metadata, and that `/robots.txt`
contains `Allow: /` without a sitemap. Do **not** use `Disallow: /` in staging:
Google needs to crawl a page to observe its `noindex` directive; blocking
crawling can leave already-discovered staging URLs visible in search results.
If staging must be private, require authentication or access control at the
staging host instead. On production, verify that noindex is absent and
robots.txt advertises the production sitemap.

## Data sync

The repository contains tooling for maintaining radio data. Upstream radio providers may apply rate limits, anti-bot protection, or change undocumented APIs without notice, so automated sync results should always be reviewed before merging.

See:

```text
docs/instant-audio-sync.md
```

for the current sync implementation and limitations.

## Contributing

Follow the [branch and release workflow](#branches-and-deployment-environments): create `feature/*` branches from `develop`, open PRs into `develop`, validate changes on staging, and promote reviewed releases to `main`.

1. Make the required code or data changes and update relevant documentation/translations.
2. Validate the Nuxt build, tests and any affected radio JSON.
3. Review station streams, artwork paths, generated metadata and SEO before merging.
4. Do not target the legacy `master` branch for new changes.

## License

This repository is maintained by ePlus.DEV. Refer to the repository settings or project owner for licensing and redistribution terms.


## Brand and domain migration

The public brand is **ePlus OnAir** with the tagline **Listen Beyond Borders.** The existing `radio.eplus.dev` production URL and `radio-new.eplus.dev` staging URL intentionally remain unchanged to preserve routing, analytics, and existing links. Replacing domains requires a separate migration plan (DNS, 301 redirects, canonical URLs, GA4, search indexing, and third-party integrations).

The official mark and social artwork live under `public/brand/onair-*`. Run `npm run brand:generate` (automatically invoked by `dev`, `build`, and `generate`) to produce compatible PNG social images, favicons and PWA icons from the SVG sources. The current production URLs remain unchanged.
