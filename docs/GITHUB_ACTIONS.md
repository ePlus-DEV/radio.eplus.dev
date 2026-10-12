# GitHub Actions: active workflows

The repository currently has **two established CI/data workflows** plus one
**selective, gated Pages deployment workflow**.

| Workflow | Trigger | Responsibility |
| --- | --- | --- |
| `.github/workflows/build.yml` (`CI`) | Pull requests for source, data, assets, workflows and dependency configuration | Unit tests; Nuxt prerender; SEO, sitemap and artwork checks; opt-in browser tests |
| `.github/workflows/instant-audio-sync.yml` (`Radio data sync`) | Manual (`workflow_dispatch`) | Discover stations/flags, validate candidate streams and artwork, then propose a data PR |

## GitHub Pages publishing (gated per environment)

`.github/workflows/deploy-github-pages.yml` is the third workflow. It runs
on trusted `main` / `develop` pushes affecting site inputs (or manual
dispatch) and is **gated** by repository Actions variables
`PAGES_DEV_READY` / `PAGES_PROD_READY`. Configure Pages destinations and
the cross-repository `PAGES_DEPLOY_TOKEN` before enabling either gate.
It pushes only the generated Nuxt static output, never source files.
See [GitHub Pages migration](./GITHUB_PAGES.md) for exact one-time setup and rollback.

## Selective deployment: only changes that affect the website

The private source repository's Pages workflow watches merges/pushes to
`develop` and `main`, but a push only starts the expensive Nuxt build when it
changes a **served application input**: Vue components/pages, player/stores,
styles/assets, radio catalog or images, translations, SEO/Nuxt config, package
dependencies, or the three build/generation scripts.

Docs, README, tests, workflow-only updates, and one-off maintenance scripts
(`sync-voh-radios.mjs`, `sync-instant-audio.mjs`) **do not trigger deployment**.
If an importer actually changes `public/radio/**` or `public/img/**` and that
data change is committed, the website correctly redeploys to show new stations.

`workflow_dispatch` remains available to **manually redeploy** either
trusted branch regardless of changed paths. The environment safety gates
`PAGES_DEV_READY` and `PAGES_PROD_READY` continue to apply. Editing the
deployment workflow itself does not launch a production deployment.

CI and CD have separate triggers: PR validation is not an automatic deployment.

## Provider-only tests (VOH)

The retired `voh-missing-radio-import.yml` workflow **must not** be re-added.
VOH scraping was a one-time research/import task, not part of normal deployments.

- `npm test` runs the default application/unit test suite (`tests/*.test.mjs`);
  it deliberately excludes `tests/providers/voh/*.test.mjs`.
- `npm run test:voh` runs only the two VOH importer/catalog regressions
  locally, without network access or a GitHub Actions workflow.
- `npm run test:all` runs both suites when a comprehensive local review is needed.
- CI automatically runs `npm run test:voh` **only if** a PR touches the VOH
  importer, VOH-specific tests, Vietnamese radio catalog, or the playback
  source utilities shared by VOH stations. Otherwise these provider-specific
  checks are skipped; general player tests continue running.
- The manual `Radio data sync` Action handles the **generic InstantAudio**
  provider and remains independent. It must not be conflated with one-time VOH
  data collection.
- GitHub Pages publishing on trusted branch pushes is independent of provider
  regression tests; it continues generating the complete static site.

## PR validation policy

- PRs to `develop` or `main`: `CI` always runs core unit tests; full Nuxt prerender and SEO audits run when app/build/data files change, but not for docs/workflow/test-only PRs.
- The repository-owned `bot/instant-audio-sync` branch: `CI` runs a separate lightweight script syntax + unit-test job. This prevents a duplicate full build of thousands of station pages.
- The radio sync action is manual-only. It no longer launches a second, redundant validation workflow for pull requests.
- The bot creates a PR against `main` and never directly pushes catalog updates into `main`.
- Browser tests remain opt-in with `ENABLE_BROWSER_TESTS=true`.

## Removed automations (2026-10-12)

- `voh-missing-radio-import.yml`: one-time discovery tied to a finished feature branch. The research/import script and tests remain in the repository for manual use.
- `changelog.yml`: release-triggered legacy `git-chglog` workflow; the most recent v3 and v3.1 jobs failed, and the release process does not depend on its generated PR.
- `dependabot-auto-merge.yml`: the repository has `allow_auto_merge=false`, so its `gh pr merge --auto` command was incompatible with repository settings; moreover, most runs were skipped for non-Dependabot PRs.

`.github/dependabot.yml` remains enabled for weekly **GitHub Actions dependency updates**. Dependabot continues to open PRs, but maintainers must review and merge them manually. Never re-enable automatic merging without an explicit security and branch-protection decision.

Deleting workflow files stops future runs; older run history may remain visible in GitHub Actions.
