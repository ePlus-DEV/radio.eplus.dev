# Contributing to ePlus OnAir

Thanks for contributing improvements to the open development of the ePlus OnAir
website. The source is public; please read the [security policy](./SECURITY.md)
and [coding guide](./AGENTS.md) before proposing changes.

## Before opening a PR

1. For normal fixes/features, branch from `develop` and open a PR against
   `develop`; `main` is production. For production hotfixes, coordinate
   with maintainers so they are also applied to `develop`.
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

Source code publication does not itself grant permission to redistribute
radio station logos, audio streams, third-party media or proprietary metadata.
A repository source license will need to be selected and published separately.
