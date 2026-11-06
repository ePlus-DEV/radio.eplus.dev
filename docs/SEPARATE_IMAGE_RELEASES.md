# Station Open Graph images and GitHub Pages size limit

The standard website build is intentionally independent of large per-station Open Graph JPEGs. GitHub Pages limits the published site to **1 GB**, and pushing smaller Git commits does not increase that limit.

## Current publishing behavior

- **Production** and **Staging** publish with `npm run generate:site` and `ONAIR_SKIP_STATION_OG=true`. This generates HTML, search assets, favicons and shared brand artwork, but excludes generated `/og/stations/*.jpg` files.
- Existing logos and images under `public/img/` remain in the website.
- Until a **verified complete** external station-image set is configured, station pages use `/brand/social-preview.png` for social sharing. This is the supported default.
- The old manually dispatched **Publish station images separately** GitHub Action was retired on 2026-11-06 after an audit found no recorded runs and no `station-images` branch in either Pages output repository. No active release depends on it.

## Local image generation (still available)

```bash
npm ci
npm run generate:images
```

This generates station OG artwork locally; **it does not publish anything**. The legacy `scripts/publish-image-batches.mjs` and its regression tests remain available as offline tooling/reference, but there is no automatic or manual GitHub Actions uploader. Do not imply that launching the normal Pages workflow will upload those JPEGs.

## Optional external image set

The app still supports `STATION_OG_BASE_URL` / `NUXT_PUBLIC_STATION_OG_BASE_URL` for a **separately hosted, immutable, complete** station JPEG collection. Before enabling it:

1. Ensure **every** station image and the complete image manifest are available at the proposed immutable HTTPS base URL.
2. Verify image URLs and manifest integrity using the existing station-image/SEO validators; avoid mutable branch URLs, private endpoints or partial uploads.
3. Configure the public variable only for the intended environment and rerun that environment's **normal website deployment**. Never use Preview's PR namespace as a permanent image host.

If these prerequisites are not met, leave the variable unset so the shared brand social image remains in use. Reintroducing an automated image publisher requires a new reviewed implementation, clear demand, an ownership/hosting decision and regression coverage; it should not be resurrected just because old scripts exist.

For the current build and release setup, see [GitHub Actions](./GITHUB_ACTIONS.md), [GitHub Pages](./GITHUB_PAGES.md), [Environments](./ENVIRONMENTS.md) and [SEO](./SEO.md).
