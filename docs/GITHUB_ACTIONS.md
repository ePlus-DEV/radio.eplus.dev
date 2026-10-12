# GitHub Actions: active workflows

The repository deliberately keeps **two** active GitHub Actions workflows.

| Workflow | Trigger | Responsibility |
| --- | --- | --- |
| `.github/workflows/build.yml` (`CI`) | Pull requests; push to `main`; manual dispatch on `main` | PR unit tests, Nuxt prerender, SEO; production deployment monitoring after `main` push |
| `.github/workflows/instant-audio-sync.yml` (`Radio data sync`) | Manual (`workflow_dispatch`) | Discover stations/flags, validate candidate streams and artwork, then propose a data PR |

## PR validation policy

- Regular PRs to `develop` or `main`: `CI` runs the usual unit tests and full Nuxt prerender.
- The repository-owned `bot/instant-audio-sync` branch: `CI` runs a separate lightweight script syntax + unit-test job. This prevents a duplicate full build of thousands of station pages.
- The radio sync action is manual-only. It no longer launches a second, redundant validation workflow for pull requests.
- The bot creates a PR against `main` and never directly pushes catalog updates into `main`.
- Browser tests remain opt-in with `ENABLE_BROWSER_TESTS=true`.

## DigitalOcean production deployment tracking

The existing CI workflow also contains a separate job, **DigitalOcean production deploy (main)**.
It runs on every push to `main`, or manually via **Actions → CI → Run workflow** with branch `main`.
It does **not** run on PRs, does **not** trigger a deployment and does **not** change the app configuration.
Production deployment itself remains owned by **DigitalOcean App Platform auto-deploy**.

Before enabling the monitor, configure these repository settings in
**GitHub → Settings → Secrets and variables → Actions**:

1. Repository **variable** `DIGITALOCEAN_APP_ID`: the production DigitalOcean App Platform app's ID
   (obtain it from **DigitalOcean → Apps → radio.eplus.dev app** URL).
2. Repository **secret** `DIGITALOCEAN_API_TOKEN`: a restricted DigitalOcean token
   with **`app:read` only**, not `app:update` and not a token with broad write permissions.

Do **not** commit the token or put it in a workflow `env:` literal.
Until both are configured, the monitoring job fails with a clear configuration error;
a green PR CI build does not itself prove deployment.

After each `main` push, the job:

- GETs `/v2/apps/{app_id}` and `/v2/apps/{app_id}/deployments` using the read-only token.
- Confirms the DigitalOcean app source matches `ePlus-DEV/radio.eplus.dev@main`
  when a GitHub source is reported.
- Waits (up to about 35 minutes) for the **pushed GitHub commit** to appear
  in the deployment component's `source_commit_hash` (or DigitalOcean's
  explicit `commit <sha> pushed to` cause if no component hash is present).
- Requires that exact deployment to be the **active** deployment, in phase `ACTIVE`.
  An unrelated existing live deployment never counts as success.
- Checks `https://radio.eplus.dev/` returns HTTP 200 and HTML content type.
- Reports success/failure in GitHub Actions job status and Step Summary,
  with a link to DigitalOcean App Platform Activity.
- Fails on matching deployment errors, wrong app, API auth error, timeout or
  failing website health checks.

The success check proves App Platform reported the expected active source
commit and the production website responds; it **does not** prove each
cached CDN asset is the same revision. If a full browser-version attestation is
needed later, introduce a version endpoint based on DigitalOcean's
`COMMIT_HASH` bindable environment variable. Do not expose API tokens or
other deployment secrets through public site files.

DigitalOcean's own Settings → Alert Policies can independently send email or
Slack notifications for deployment successes/failures and infrastructure
maintenance. These alerts are separate from GitHub Actions.

## Removed automations (2026-10-12)

- `voh-missing-radio-import.yml`: one-time discovery tied to a finished feature branch. The research/import script and tests remain in the repository for manual use.
- `changelog.yml`: release-triggered legacy `git-chglog` workflow; the most recent v3 and v3.1 jobs failed, and the release process does not depend on its generated PR.
- `dependabot-auto-merge.yml`: the repository has `allow_auto_merge=false`, so its `gh pr merge --auto` command was incompatible with repository settings; moreover, most runs were skipped for non-Dependabot PRs.

`.github/dependabot.yml` remains enabled for weekly **GitHub Actions dependency updates**. Dependabot continues to open PRs, but maintainers must review and merge them manually. Never re-enable automatic merging without an explicit security and branch-protection decision.

Deleting workflow files stops future runs; older run history may remain visible in GitHub Actions.
