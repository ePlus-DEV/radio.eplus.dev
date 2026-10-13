# GitHub Actions: active workflows

The repository currently has **two established CI/data workflows** plus one
**prepared, disabled-by-default Pages deployment workflow**.

| Workflow | Trigger | Responsibility |
| --- | --- | --- |
| `.github/workflows/build.yml` (`CI`) | Pull requests for source, data, assets, workflows and dependency configuration | Unit tests; Nuxt prerender; SEO, sitemap and artwork checks; opt-in browser tests |
| `.github/workflows/instant-audio-sync.yml` (`Radio data sync`) | Manual (`workflow_dispatch`) | Discover stations/flags, validate candidate streams and artwork, then propose a data PR |

## Prepared GitHub Pages publishing (disabled by default)

`.github/workflows/deploy-github-pages.yml` is the planned third workflow. It runs
only on trusted `main` / `develop` pushes or manual dispatch and is **gated** by
repository Actions variables `PAGES_DEV_READY` / `PAGES_PROD_READY`. Both are
off until an organization administrator creates the public Pages destinations,
configures branch publishing and stores `PAGES_DEPLOY_TOKEN` in this private
source repository. It pushes only the Nuxt static output, never source files.
See [GitHub Pages migration](./GITHUB_PAGES.md) for exact one-time setup and rollback.

## PR validation policy

- Regular PRs to `develop` or `main`: `CI` runs the usual unit tests and full Nuxt prerender.
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

## Repository-wide execution queue

All four workflows, including `publish-station-images.yml`, share
`onair-repository-work`. `queue: max` preserves distinct waiting runs;
`cancel-in-progress: false` lets the active run finish. Only one workflow
executes at a time, even across PRs, source branches and deployment targets.

Queued CI runs skip closed PRs or superseded head SHAs before expensive work.
Queued website deployments skip commits superseded on their source branch.
Multiple pending runs are waiting work, not concurrently executing jobs.
Old runs dispatched before this configuration keep their earlier settings.
