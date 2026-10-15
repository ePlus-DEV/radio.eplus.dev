# Security policy

## Reporting a vulnerability

Please **do not publish vulnerabilities, passwords, private keys, provider API tokens,
or full exploit details in a public GitHub issue or pull request**.

Report security concerns privately to **admin@eplus.dev** (subject:
`ePlus OnAir security report`), or use GitHub's **Report a vulnerability**
option on the repository's **Security** tab if private vulnerability reporting
is enabled. Include a concise description, affected file or endpoint,
impact, and reproducible steps without publishing live credentials.

This is a community-maintained site. A specific response or fix SLA is not guaranteed.

## Secrets and public deployment

- `main` and `develop` are **public source** branches. Public forks,
  PR diffs and commit history can permanently expose any committed value.
- Never store live credentials in `.env.example`, `NUXT_PUBLIC_*`,
  source code, tests, screenshots, CI logs, discussions or PR comments.
- `NUXT_PUBLIC_*` values are included in client bundles/static pages.
  Only put information there that is safe for every visitor to see.
- The search-only Algolia key (if configured) must be limited to **search**,
  restricted to the appropriate indexes. **Never** use an Admin/Write key.
- Publishing PATs belong in GitHub **Environment Secrets**, ideally with
  access only to the specific destination repositories. Review and rotate
  those tokens regularly, use minimal permissions, and protect releases.
- Do not let untrusted fork PR code access write tokens. Prefer read-only
  PR checks and separate trusted deployments.

If a secret was previously committed, **revoke or rotate it immediately**.
Removing it from `main` is not enough: earlier commits, tags, forks,
clones, caches and pull-request diffs may still contain it. After revocation,
consider GitHub's documented sensitive-data history-removal process,
coordinate with collaborators and recheck the full public history.

## Vulnerability classes

Particularly useful reports include credential leakage, malicious
station artwork or catalog payloads, dependency vulnerabilities,
supply-chain / GitHub Actions permission issues, stored XSS, unsafe
cross-origin requests and data/privacy leaks.

Third-party radio streams, station logos and music programming belong to
their respective operators and may be subject to separate rights or terms.
