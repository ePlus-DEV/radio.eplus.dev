# Development guide

This guide covers local setup, common scripts, and source layout for **ePlus OnAir**. For branch promotion, deployment credentials, and public domains, use [Environments](./ENVIRONMENTS.md) rather than this local-development guide.

## Requirements

- Node.js **24.15.0** (see [package.json](../package.json)).
- npm, using the committed `package-lock.json`.
- Optional browser support for Playwright checks.

## Start the app locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. The `predev` script generates the local search index and station-image metadata automatically.

If you need local environment configuration, create an ignored `.env` and use **only** values appropriate for local use. Do **not** copy credentials from a deployment environment or commit secrets. All `NUXT_PUBLIC_*` values become visible to visitors when statically generated.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Nuxt's development server |
| `npm test` | Run Node unit and regression tests |
| `npm run test:ui` | Run optional Playwright browser tests |
| `npm run build` | Build the Nuxt application |
| `npm run generate:site` | Generate the website for GitHub Pages without the per-station OG JPEG bundle |
| `npm run generate` | Generate the full static site for local testing, including station OG generation |
| `npm run preview` | Serve already-built output locally |

The script definitions and runtime version in [package.json](../package.json) are authoritative. The automated browser-test gate is opt-in via `ENABLE_BROWSER_TESTS=true`; unit tests and relevant prerender checks remain required.

## Project layout

| Location | Responsibility |
| --- | --- |
| `pages/`, `layouts/`, `components/` | Page routing and UI |
| `components/player/`, `stores/`, `composables/`, `utils/` | Audio playback, state, navigation, helpers |
| `public/radio/<area>/<country>.json` | Versioned country/station catalogs |
| `public/img/` | Local station artwork and country assets |
| `lang/` | Localized interface strings |
| `build/`, `scripts/` | Site generation, SEO, radio synchronization, media tooling |
| `tests/` | Automated regression coverage |
| `.github/workflows/` | CI, preview, releases and radio sync |

## Working on changes

1. Create a feature/fix branch and target `develop` with a PR.
2. Run `npm test`. For changed UI, run the optional browser checks; for changed SEO, routing or static output, run `npm run generate:site` and the related validators.
3. Check the PR's isolated Development Preview (representative routes only). Merging into `develop` publishes the complete Staging build after its deployment gate passes.
4. Release to Production with a reviewed `develop` → `main` PR. Never treat a green PR Preview build, or its fallback 404 redirect, as proof that a deep link was rendered successfully.

For the exact GitHub Environment and Pages repository mapping, see [Environment contract](./ENVIRONMENTS.md), [GitHub Actions](./GITHUB_ACTIONS.md), [Pages publishing](./GITHUB_PAGES.md) and [PR previews](./PR_PREVIEWS.md).

## Additional guidance

- [SEO and analytics](./SEO.md): canonical URLs, indexability, structured data and sitemap boundaries.
- [Station OG image policy](./SEPARATE_IMAGE_RELEASES.md): the Pages size limit, local generation and optional verified external images (no automatic uploader).
- [Station synchronization](./instant-audio-sync.md): source and catalog integrity.
- [Contributing](../CONTRIBUTING.md), [security policy](../SECURITY.md), [AI / contributor rules](../AGENTS.md) and [project context](./PROJECT_CONTEXT.md).

**Licensing:** There is currently no source license file. Public access does not grant reuse or redistribution rights. Station logos and audio streams may have separate third-party rights.
