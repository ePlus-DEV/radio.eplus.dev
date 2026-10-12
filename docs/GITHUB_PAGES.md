# ePlus OnAir GitHub Pages — existing public repositories, no custom domains

Keep source private at `ePlus-DEV/radio.eplus.dev`. Publish only static
`.output/public` into the two **existing public** output repositories:

| Branch | Public repository | Test URL, no custom DNS | SEO |
| --- | --- | --- | --- |
| `develop` | `ePlus-DEV/onair-staging-pages` | https://eplus-dev.github.io/onair-staging-pages/ | noindex |
| `main` | `ePlus-DEV/onair-production-pages` | https://eplus-dev.github.io/onair-production-pages/ | noindex preview |

**DO NOT RENAME repositories.** There is no need for an
`ePlus-DEV.github.io` organization-root repository. A GitHub **project**
Pages URL always includes the output repository name until you configure a
custom domain.

These are previews only. The live `https://radio.eplus.dev` remains on
DigitalOcean with its existing domain, GA4 and production SEO unchanged.

## One-time GitHub settings

In **each public repository**:

1. Settings → Pages → Build and deployment: **Deploy from a branch**
2. Branch: `main`, folder: `/(root)`, Save
3. Leave **Custom domain empty** until you explicitly decide to add one

In the **private source repository** under
Settings → Secrets and variables → Actions:

- Secret: `PAGES_DEPLOY_TOKEN` with **Contents: Read/write** on both public
  output repositories, or classic PAT with `public_repo` scope.
- Variable: `PAGES_DEV_READY=true` to allow `develop` publishing.
- Variable: `PAGES_PROD_READY=false` until you are ready to publish a
  **public production-branch preview**. Change it to `true` when ready.
- `PAGES_DEV_SITE_URL` is **unused by this no-domain workflow**; do not
  rely on previous custom-domain settings.

No DNS records or custom-domain settings are needed for either test URL.
The workflow generates no `CNAME`.

## Behavior and safety

`.github/workflows/deploy-github-pages.yml` publishes trusted merges/pushes
affecting web content or a manually dispatched trusted branch. It **does not
deploy** on docs, unit-tests, GitHub-workflow-only or one-time radio-crawler
changes. Unlike normal CI, a deployment only runs if the corresponding
`PAGES_*_READY` gate is `true`.

The workflow first authenticates the token and checks the **exact output
repository** and write permission. It runs this **before** `npm ci` or the
heavy `npm run generate`, so a missing repository or expired PAT fails fast.

Nuxt receives:
- DEV: `NUXT_APP_BASE_URL=/onair-staging-pages/`
- PROD preview: `NUXT_APP_BASE_URL=/onair-production-pages/`

It also receives the matching `NUXT_PUBLIC_SITE_URL` including the project
subpath, and `NUXT_PUBLIC_NO_INDEX=true` on **both** preview sites. Asset
URLs, static JSON fetches, navigation and favicons must respect this base.
Run the project URL/deep-link validator before pushing.

The workflow retains the GitHub Pages 1 GB content-size limit and copies
existing source `public/img/`, `public/radio/`, and `public/brand/` files
unchanged. While previewing without domains, per-station production OG JPEG
generation is disabled and a shared brand social image is used instead.

## First deployment and verification

After merging the configuration PR into `develop`, publish with a manual
workflow dispatch on `develop` (or with a trusted website-related push).
Verify the source Actions job, the public Pages repository content and its
Pages deployment separately; a green Nuxt build is not yet a green Pages site.

Check **homepage**, direct station URLs, refreshing a station, local radio
JSON, logos, flags, CSS/JS, audio playback and navigation. Both preview sites
must remain `noindex`, and neither should publish a sitemap or `CNAME`.

When you are ready to test `main`, enable `PAGES_PROD_READY=true` and run
the same workflow on `main` **only after the workflow has been promoted to
main**. This does not change `radio.eplus.dev` or DigitalOcean.

## Future custom domains

Adding real domains is a **separate, explicitly approved change**. Then
update Nuxt URL/base-path/SEO rules, GitHub Pages CNAME configuration and DNS
together, and validate site indexing and size again. Do not automatically
assume production domain cutover or flip indexing based on branch name alone.
