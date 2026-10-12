# GitHub Actions: active workflows

The repository deliberately keeps **two** active GitHub Actions workflows.

| Workflow | Trigger | Responsibility |
| --- | --- | --- |
| `.github/workflows/build.yml` (`CI`) | Pull requests; pushes to `main` and `develop`; manual dispatch on either | PR unit tests, Nuxt prerender, SEO; production + staging deployment status monitoring |
| `.github/workflows/instant-audio-sync.yml` (`Radio data sync`) | Manual (`workflow_dispatch`) | Discover stations/flags, validate candidate streams and artwork, then propose a data PR |

## PR validation policy

- Regular PRs to `develop` or `main`: `CI` runs the usual unit tests and full Nuxt prerender.
- The repository-owned `bot/instant-audio-sync` branch: `CI` runs a separate lightweight script syntax + unit-test job. This prevents a duplicate full build of thousands of station pages.
- The radio sync action is manual-only. It no longer launches a second, redundant validation workflow for pull requests.
- The bot creates a PR against `main` and never directly pushes catalog updates into `main`.
- Browser tests remain opt-in with `ENABLE_BROWSER_TESTS=true`.

## DigitalOcean App Platform deployment tracking

The **same CI workflow** tracks DigitalOcean deployments of **both** long-lived
branches, without adding another workflow and without requesting deployments.

| Git branch | DigitalOcean environment | GitHub Actions variable | Health-check domain |
| --- | --- | --- | --- |
| \`main\` | Production | \`DIGITALOCEAN_APP_ID\` | \`https://radio.eplus.dev/\` |
| \`develop\` | Staging | \`DIGITALOCEAN_STAGING_APP_ID\` | \`https://radio-new.eplus.dev/\` (default) |

If the staging App Platform application actually serves the alternate hostname
\`https://new-radio.eplus.dev/\`, set the optional repository variable
\`DIGITALOCEAN_STAGING_SITE_URL\` to **that complete HTTPS URL**. Only these
two staging hosts are accepted, to prevent a misconfigured status check from
quietly validating a different application or an external destination.

### One-time GitHub configuration

Go to **Repository → Settings → Secrets and variables → Actions** and add:

- Repository **variable** \`DIGITALOCEAN_APP_ID\`: production App Platform application ID.
- Repository **variable** \`DIGITALOCEAN_STAGING_APP_ID\`: staging App Platform application ID.
- Optional repository **variable** \`DIGITALOCEAN_STAGING_SITE_URL\`: actual staging HTTPS URL
  if it is \`https://new-radio.eplus.dev/\` rather than the documented default.
- Repository **secret** \`DIGITALOCEAN_API_TOKEN\`: a restricted DigitalOcean API token
  with **\`app:read\` only**, usable for both applications.

DigitalOcean must already be configured to **auto-deploy** production from
\`ePlus-DEV/radio.eplus.dev@main\` and staging from
\`ePlus-DEV/radio.eplus.dev@develop\`, each to its correct App Platform app.
These GitHub settings do not change how DigitalOcean deploys.

Never store the token in source or as a plain repository variable.
Until the relevant App ID and token are configured, the corresponding
monitor reports a configuration error rather than a false success.

### What runs, and when

- Normal pull requests: CI unit tests/prerender only; **no DigitalOcean API** calls.
- Push to \`main\`: status-check the production app and production website.
- Push to \`develop\`: status-check the staging app and staging website.
- Manual recheck: **Actions → CI → Run workflow**, selecting **\`main\`** or
  **\`develop\`** to inspect the corresponding commit and environment.

Each job uses read-only GET requests to
\`/v2/apps/{app_id}\` and \`/v2/apps/{app_id}/deployments\`, confirms that
the app source follows the expected repository/branch (when GitHub sources
are exposed), and waits up to approximately **35 minutes** for an App Platform
deployment with **the pushed commit SHA** to become the **active** deployment
with phase \`ACTIVE\`. Then it checks the correct environment's website
responds HTTP 200 HTML. It fails on wrong app/branch, deploy errors, API
access errors, unhealthy website, or timeout.

This verifies deployment activation and site reachability, **not** complete
CDN cache freshness or playback of all radio channels. Staging's \`noindex\`
configuration is separately validated in the regular PR build CI, and its
deployed environment must keep \`NUXT_PUBLIC_NO_INDEX=true\` as documented in
\`docs/SEO.md\`.

DigitalOcean App Platform can also send email or Slack alerts for successful
and failed deployments via its own Alert Policies.

## Removed automations (2026-10-12)

- `voh-missing-radio-import.yml`: one-time discovery tied to a finished feature branch. The research/import script and tests remain in the repository for manual use.
- `changelog.yml`: release-triggered legacy `git-chglog` workflow; the most recent v3 and v3.1 jobs failed, and the release process does not depend on its generated PR.
- `dependabot-auto-merge.yml`: the repository has `allow_auto_merge=false`, so its `gh pr merge --auto` command was incompatible with repository settings; moreover, most runs were skipped for non-Dependabot PRs.

`.github/dependabot.yml` remains enabled for weekly **GitHub Actions dependency updates**. Dependabot continues to open PRs, but maintainers must review and merge them manually. Never re-enable automatic merging without an explicit security and branch-protection decision.

Deleting workflow files stops future runs; older run history may remain visible in GitHub Actions.
