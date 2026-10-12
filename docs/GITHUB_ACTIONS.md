# GitHub Actions: active workflows

The repository deliberately keeps **two** active GitHub Actions workflows.

| Workflow | Trigger | Responsibility |
| --- | --- | --- |
| `.github/workflows/build.yml` (`CI`) | Pull requests for source, data, assets, workflows and dependency configuration | Unit tests; Nuxt prerender; SEO, sitemap and artwork checks; opt-in browser tests |
| `.github/workflows/instant-audio-sync.yml` (`Radio data sync`) | Manual (`workflow_dispatch`) | Discover stations/flags, validate candidate streams and artwork, then propose a data PR |

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
