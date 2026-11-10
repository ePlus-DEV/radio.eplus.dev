# Contributing to ePlus OnAir

Thanks for contributing improvements to the open development of the ePlus OnAir
website. The source is public; please read the [security policy](./SECURITY.md)
and [coding guide](./AGENTS.md) before proposing changes.

## Before opening a PR

1. For normal fixes/features, branch from `staging` and open a PR against
   `staging`; `main` is production. For production hotfixes, coordinate
   with maintainers so they are also applied to `staging`.
2. Run `npm ci` using the Node version in `.node-version`, then `npm test`.
   Run `npm run test:ui` where browser behavior is changed; Playwright
   is optional in the default CI. For substantial rendering/SEO changes,
   run `npm run generate:site`.
3. Describe the issue, user impact, changes, test results and (if UI-related)
   screenshots at desktop and mobile sizes. Avoid unrelated generated files.
4. Keep UI text translated into all supported locales; check keyboard
   navigation, touch targets and light/dark contrast.
5. Never include credentials, private .env files, tokens, personal user data,
   third-party copyrighted source code, or unlicensed artwork in a PR.
   The ignored `.env` file is only for local development; `.env.example`
   must remain safe to publish.
6. If contributing a new station, verify its stream source, name, country,
   artwork permission and official site; do not embed short-lived access
   tokens or upload private/copyrighted files.
7. If a security issue is discovered, report it **privately** as described
   in [SECURITY.md](./SECURITY.md), not in a public issue.

## Licensing and content provenance

Original code you contribute must be your own or material you have the right
to submit under the project's [MIT License](./LICENSE). Contributors retain
their own copyright; submission does not transfer ownership to ePlus OnAir.
Keep attribution and license notices required by upstream dependencies.

The [Content & third-party rights](./CONTENT_AND_THIRD_PARTY_RIGHTS.md)
policy excludes broadcasters' audio, third-party station logos/artwork,
provider metadata and ePlus branding from the default MIT code grant.
A publicly accessible stream URL is **not** permission to record, mirror,
rebroadcast or redistribute audio. Explain the provenance of any new
catalog entry, logo, image or provider integration in its PR and include
evidence of permission when available.

Never place private environment values, tokens or service credentials in
source, screenshots, test fixtures, issue comments or PR descriptions.
Browser-visible `NUXT_PUBLIC_*` values are not a safe place for secrets.
For copyright or takedown requests, contact **report@eplus.dev** directly.
