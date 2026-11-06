# ePlus OnAir

**Listen Beyond Borders.** Discover and listen to live radio stations from around the world.

**[Listen live](https://radio.eplus.dev/)** · [Staging](https://stg.radio.eplus.dev/) · [Development previews](https://preview.radio.eplus.dev/)

ePlus OnAir is built with **Nuxt 4, Vue 3 and Nuxt UI**. This repository contains the application source, station catalogs, tests and release workflows; the published websites are hosted in separate GitHub Pages repositories.

## Highlights

- Explore radio stations by region and country, with search and station details.
- Listen to supported audio streams, including HLS, with a persistent player.
- Save favorites, return to recently played stations and use the app in seven languages.
- Switch between light and dark mode on desktop or mobile.

## Quick start

Requires **Node.js 24.15.0** and npm.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). See the [development guide](./docs/DEVELOPMENT.md) for environment configuration, tests, builds and the source layout.

## Environments

| Environment | Source | Website |
| --- | --- | --- |
| **Production** | `main` | [radio.eplus.dev](https://radio.eplus.dev/) |
| **Staging** | `staging` | [stg.radio.eplus.dev](https://stg.radio.eplus.dev/) |
| **Preview** | PR targeting `staging` | [preview.radio.eplus.dev](https://preview.radio.eplus.dev/) |

Development previews are published at `/pr-preview/pr-<number>/`; there is no separate long-lived `dev` or `develop` branch. Only Production is indexable and uses production GA4. Staging and Preview remain `noindex`.

Browser-tab titles are distinct by default: **ePlus OnAir** (Production), **ePlus OnAir — Staging**, and **ePlus OnAir — Preview**. Each GitHub Environment can override its own title with `NUXT_PUBLIC_SITE_NAME`.

The publishing source is `staging`; production releases are reviewed PRs from `staging` to `main`. Preview builds remain isolated per feature PR.

## Documentation

| Guide | What it covers |
| --- | --- |
| [Development](./docs/DEVELOPMENT.md) | Local setup, commands and project structure |
| [Environments](./docs/ENVIRONMENTS.md) | Three-tier architecture, release flow and migration |
| [PR previews](./docs/PR_PREVIEWS.md) | Preview URLs, build scope and troubleshooting |
| [GitHub Actions](./docs/GITHUB_ACTIONS.md) · [GitHub Pages](./docs/GITHUB_PAGES.md) | CI and deployment runbooks |
| [SEO](./docs/SEO.md) · [Station images](./docs/SEPARATE_IMAGE_RELEASES.md) | Indexing, analytics and image publishing |

For contributions, see [CONTRIBUTING.md](./CONTRIBUTING.md), [SECURITY.md](./SECURITY.md) and [AGENTS.md](./AGENTS.md). Detailed architectural decisions live in [PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md).

## License

A source license has **not yet been selected**. Public visibility alone does not grant permission to reuse or redistribute the code, station artwork or third-party streams.
