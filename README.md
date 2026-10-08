> [!IMPORTANT]
> **Canonical / active repository**
>
> This is the current Radio ePlus codebase used for `https://radio.eplus.dev`.
> Use this repository for the radio UI/player, station data, sync tooling, tests, and deployment work.
>
> **Do not use `ePlus-DEV/get-radio` for new work.** That repository is a legacy PHP crawler kept only for historical reference and is not part of the current production flow.

# Radio ePlus

Radio ePlus is a Nuxt-based internet radio application for browsing and listening to live radio stations from around the world.

**Website:** https://radio.eplus.dev

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

## Search

Algolia integration is optional during build and local development. When Algolia credentials are not configured, the application can still build without them.

## SEO

Radio ePlus prerenders the radio route hierarchy, exposes server-rendered country/station links, generates structured data, and includes catalog-backed routes in the sitemap. The canonical production site URL defaults to:

```text
https://radio.eplus.dev
```

Override it using `NUXT_PUBLIC_SITE_URL` when needed.

See [`docs/SEO.md`](./docs/SEO.md) for the current SEO implementation and known limitations, including the current no-prefix i18n/hreflang limitation and unresolved sitewide links to pages that do not yet exist.

## Data sync

The repository contains tooling for maintaining radio data. Upstream radio providers may apply rate limits, anti-bot protection, or change undocumented APIs without notice, so automated sync results should always be reviewed before merging.

See:

```text
docs/instant-audio-sync.md
```

for the current sync implementation and limitations.

## Contributing

1. Create a feature branch from `develop` and open the PR against `develop`.
2. Make the required code or data changes.
3. Validate the Nuxt build and any affected radio JSON.
4. Open a pull request.
5. Review station streams, artwork paths, and generated metadata before merging.

## License

This repository is maintained by ePlus.DEV. Refer to the repository settings or project owner for licensing and redistribution terms.

