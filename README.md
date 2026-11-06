# ePlus OnAir

**Listen Beyond Borders.** Discover and listen to live radio stations from around the world.

**[Listen live](https://radio.eplus.dev/)** · [Staging](https://staging.radio.eplus.dev/) · [Development previews](https://preview.radio.eplus.dev/)

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
| **Staging** | `develop` | [staging.radio.eplus.dev](https://staging.radio.eplus.dev/) |
| **Development** | PR targeting `develop` | [preview.radio.eplus.dev](https://preview.radio.eplus.dev/) |

Development previews are published at `/pr-preview/pr-<number>/`; there is no separate long-lived `dev` branch. Only Production is indexable and uses production GA4. Staging and Development remain `noindex`.

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
