# Pull request previews (Cloudflare Pages)

This repository publishes **production** and **staging** through GitHub Pages.
PR previews are a separate, optional Cloudflare Pages Git-integrated project.
They must NEVER publish into the production or staging Pages repositories.

## Why Cloudflare Pages Git integration?

- Cloudflare automatically builds a new preview when an **in-repository** PR branch is pushed, adds a deployment/check link to the PR, and updates its branch alias on subsequent commits.
- No deployment token needs to be given to GitHub `pull_request` jobs, and there is no `pull_request_target` checkout of untrusted code.
- The preview host is isolated on `*.pages.dev` and has no production or staging DNS binding.
- Existing `.github/workflows/build.yml` and production/staging deploys remain unchanged.

**This feature is NOT activated just by merging this PR.** One-time Cloudflare project configuration is required, as below. Do not claim a live preview until the Pages check succeeds and the URL loads.

## One-time Cloudflare setup (owner)

1. In Cloudflare **Workers & Pages → Create → Pages → Connect to Git**, authorize GitHub repository `ePlus-DEV/radio.eplus.dev`. Use a new, separate project, suggested name `onair-pr-preview`. Do NOT connect the existing production/staging output repositories.
2. Configure build:
   - Framework preset: **None** (static output)
   - Root directory: repository root
   - Build command: `npm run build:pr-preview`
   - Output directory: `.output/public`
   - Node version: `NODE_VERSION=24.15.0`
   - No Cloudflare Pages Functions/Workers runtime and no application secrets.
3. Set the project's production branch to `main`, then **disable automatic production branch deployments**. The initial project creation may generate a noindex deployment; it is not the real production radio.
4. Enable preview branch deployments. **Custom branches** is recommended: include `*`; exclude `develop`, `bot/*`, `dependabot/*` to avoid duplicate integration/bot builds. Release PRs from `develop` can use the existing staging URL.
5. **Do not** add `radio.eplus.dev`, `new-radio.eplus.dev` or any production/staging custom domain to this project. Keep previews on `*.pages.dev`.
6. Open a PR from a branch in the **same repository** (not a fork). Look for the Cloudflare Pages GitHub check and its **Visit Preview** URL; push another commit and confirm the preview updates.
7. Test desktop/mobile layouts, deep station URLs, artwork, audio streaming, 404s and browser console. Ensure generated HTML contains robots `noindex`, no production GA4, and no sitemap.

Preview builds use `CF_PAGES_URL` provided by Cloudflare to set `NUXT_PUBLIC_SITE_URL`, and force `NUXT_PUBLIC_NO_INDEX=true`, `NUXT_APP_BASE_URL=/`, and shared station OG images. Even if inherited environment variables accidentally point to production, `scripts/build-pr-preview.mjs` overrides them.

### Known constraints and cost

- Git integration previews **do not run for forked PRs**. Use ordinary CI and a trusted same-repository branch if a visual review of a fork is necessary. Do not expose publishing credentials to forked PR code.
- Cloudflare Pages Free has a **20-minute build timeout** and **20,000-file per-deployment limit** (plus 25 MiB per individual file). This application currently generates thousands of station routes and assets; **a successful preview is not guaranteed until a real deployment confirms its runtime and output size**. If the limit is exceeded, keep the Cloudflare project disabled and switch to a separately reviewed GitHub Actions build + Pages Direct Upload design; do not weaken production CI or silently omit station pages.
- Cloudflare Pages Git integration creates branch aliases (e.g. `feat-my-change.onair-pr-preview.pages.dev`) and immutable deployment URLs. It does **not** guarantee a `pr-123` hostname. Use the actual URL from the PR check.
- No additional DigitalOcean App Platform preview apps are created; the earlier [DigitalOcean PR preview proposal](https://github.com/ePlus-DEV/radio.eplus.dev/pull/163) was closed without merge.
- Avoid publishing sensitive test data: preview sites are publicly reachable unless you separately configure Cloudflare Access.

## Diagnostics

The preview command runs `npm run generate:site` and existing generated-output audits:

- `scripts/assert-staging-noindex.mjs`
- `scripts/assert-ga4-output.mjs` in staging mode
- `scripts/assert-project-pages-output.mjs` with the root custom-domain asset base
- `scripts/check-pages-build.mjs` for size, source-map and unsafe-file checks

If Cloudflare fails **before** publishing, inspect its build logs. If the build takes over 20 minutes or has over 20,000 files on Free, use the fallback architecture above rather than bypassing checks.

Official docs: [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/), [branch controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/), [preview URLs](https://developers.cloudflare.com/pages/configuration/preview-deployments/), [limits](https://developers.cloudflare.com/pages/platform/limits/).
