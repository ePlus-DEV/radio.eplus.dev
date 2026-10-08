# AGENTS.md

This file is the short operational guide for coding agents and contributors working on **Radio ePlus**.

For deeper history and rationale, read [`docs/PROJECT_CONTEXT.md`](./docs/PROJECT_CONTEXT.md).

## Repository identity

- Canonical repository: `ePlus-DEV/radio.eplus.dev`
- Canonical production site: `https://radio.eplus.dev`
- Do not use `ePlus-DEV/get-radio` for new work; it is legacy reference code.
- Treat `main` as the source of truth. Create a branch and PR for normal code/data changes.

## Current stack

- Nuxt 4 / Vue 3
- Node.js 24.15.0
- Tailwind CSS 4
- DaisyUI 5
- Pinia
- Native HTML5 `<audio>` + `hls.js`
- Nuxt Color Mode
- Nuxt i18n
- Nuxt Image
- Algolia
- Font Awesome

Always check `package.json` before assuming exact versions.

## Files to read before major changes

- `README.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/SEO.md` before changing routes, SSR/prerender behavior, metadata, sitemap, or i18n URL strategy
- `assets/css/main.css` for theme architecture
- `components/player/Player.vue` for playback lifecycle
- `utils/radio-source-plan.mjs` for fallback-source planning
- `tests/theme-consistency.test.mjs`
- `tests/player-hls-startup.test.mjs`
- `tests/radio-source-plan.test.mjs`
- `docs/instant-audio-sync.md` when changing radio data or sync automation

## UI and dark-mode invariants

The site previously mixed three independent styling systems:

1. Tailwind `dark:` utilities;
2. DaisyUI `data-theme`;
3. component-specific hard-coded light/dark colors.

That caused partially themed pages. The current rule is:

- semantic site colors belong in `assets/css/main.css` as `--radio-*` tokens;
- Nuxt Color Mode classes and DaisyUI `data-theme` must resolve to the same palette;
- DaisyUI is a control/component primitive layer, not a separate visual theme;
- use `--radio-surface`, `--radio-surface-soft`, `--radio-text`, `--radio-text-muted`, `--radio-border`, etc. for structural colors;
- intentional status/accent colors such as rose/amber/emerald are allowed;
- do not reintroduce one-off combinations such as `bg-white dark:bg-slate-*` across the app.

Run `npm test`; `tests/theme-consistency.test.mjs` exists specifically to catch theme regressions.

### Header dropdowns

Do not rely on DaisyUI `dropdown` + `tabindex/focus-within` as the source of truth for interactive header menus that mutate app state (language/theme/account-style controls).

For the language selector:

- Vue owns an explicit `open` state;
- selection closes the menu before i18n rerenders;
- outside click, Escape, Tab and route changes close it;
- keyboard focus must be restored or advanced intentionally;
- keep `aria-expanded`, `aria-haspopup`, `role=menu` and menu-item roles synchronized with behavior.

Regression guard: `tests/language-dropdown.test.mjs`.

## Player / HLS invariants

The current player is intentionally **Native Audio + hls.js**, not Video.js.

Important rules:

- Prefer `Hls.isSupported()` / Media Source Extensions first.
- Use browser-native HLS only as fallback when hls.js/MSE is unavailable.
- Do not call `media.play()` immediately after `hls.attachMedia()`.
- For hls.js playback, wait for manifest/media readiness; the current code starts playback from the `MANIFEST_PARSED` path.
- Let hls.js own HLS network/media recovery. Do not simultaneously schedule duplicate retries from the raw `<audio>` error handler.
- Keep retries bounded. `MAX_STREAM_ATTEMPTS` is defined in `utils/radio-source-plan.mjs`.
- Do **not** automatically wrap HLS `.m3u8` URLs in a generic CORS proxy. HLS manifests often contain relative child playlists/segments that generic proxies break.
- A station explicitly marked `cros: true` is different: its URL is intentionally proxied before reaching the player and must continue to work.
- Plain non-HLS streams may still receive a generated proxy fallback.
- Preserve fallback order and deduplication.
- Previous/Next controls navigate the country station list; they are not source-fallback controls.
- Previous/Next station navigation wraps around at the beginning/end of the list and keeps autoplay behavior consistent with selecting a station from the queue.
- Keep station navigation logic in `utils/station-navigation.mjs` and cover it with `tests/station-navigation.test.mjs`.
- The large player metadata area is the single source of truth for the current track. Do not render `currentMedia` a second time in a lower "Now playing" strip.
- When a provider supplies a trustworthy `nextMedia` value (for example Zing), the lower strip may show that as `panel.next`; do not infer a future track from generic playlist/history arrays.
- In the player surface, structural colors stay neutral/theme-based. Rose is the primary playback/live accent; avoid strong competing cyan/blue structural gradients in light mode.

The Zing MP3 EDM station is a useful regression case:

`/asia/viet-nam/edm-radio-zing-mp3`

A valid HLS stream must not download successfully in DevTools while the UI prematurely cycles to `6/6` and reports failure.

Run:

```bash
npm test
```

before changing the player.

## Station routing, schedules and Zing invariants

Nuxt can reuse the station page component when only route params change. Treat station-specific async data as **route-scoped state**.

- The station detail page is the source of truth for the country catalog and active station metadata.
- `PanelStation` is presentational and never fetches its own catalog.
- Every page that renders `PanelStation` must pass the same `stations` list and active station identity used by the player. Do not render a bare `<PanelStation />`, or it will intentionally fall back to an empty list.
- On area/country/station route changes, invalidate old requests and clear polling, schedule, song, playlist, lyric popup/lines and transient stream state before activating the new station.
- Async schedule/detail/lyric responses must verify the current request version before mutating UI state.
- Zing behavior must be detected from the Zing schedule provider URL, not from `country === viet-nam`.
- The lyric control is Zing-specific; do not show it for every Vietnamese station.
- `schedule` is legacy data and can contain non-URL values such as booleans. Normalize and fetch only valid HTTP(S) URLs.
- Keep schedule/search tab state route-aware so a previous station's UI does not leak into the next station.
- Station catalog/static metadata may run during SSR/prerender, but realtime provider calls must not.
- Schedule, current-song/detail and lyric requests are browser-only and must be guarded with `import.meta.client`.
- Do not start realtime polling until the station page is mounted/hydrated; prerendering must never depend on external schedule providers such as Webrad.io or Zing endpoints.

Regression guards:

- `tests/station-route-lifecycle.test.mjs`
- `tests/station-schedule.test.mjs`

## Radio data invariants

- World metadata: `public/radio/world.json`
- Per-country stations: `public/radio/<area>/<country>.json`
- Generated world data: `data/world.ts`
- Prefer local station artwork under `public/img/<area>/<country>/`
- Preserve existing stations when sync automation discovers new data.
- Validate primary and fallback stream URLs before writing data.
- Do not assume upstream radio-provider APIs are stable or documented.

See `docs/instant-audio-sync.md`.

## i18n and text direction

Station names/descriptions may use Arabic or other RTL/mixed scripts.

- Preserve `dir="auto"` on user/provider-supplied station text where present.
- Do not assume all station titles use Latin characters.
- Keep translations in `lang/`.

## Font Awesome licensing state

The application UI is **Font Awesome Free-only**.

- Register visible UI icons centrally in `config/fontawesome-icons.mjs`.
- `nuxt.config.ts` must not reintroduce `proIcons`.
- Do not add `@fortawesome/pro-*` or `@fortawesome/sharp-*` packages without an explicit architecture/licensing decision.
- Do not commit Font Awesome registry auth tokens or a private-registry `.npmrc`.
- Prefer a small inline SVG for critical navigation controls when it avoids an unnecessary icon-runtime dependency (for example Back to top).
- Run `tests/fontawesome-icons.test.mjs` when adding/changing icons.

## SEO invariants

Read `docs/SEO.md` before changing route/data-loading behavior.

- Country and station discovery links must exist in SSR/prerendered HTML; do not move catalog discovery behind `onMounted()`.
- Realtime schedule/song/lyric providers remain client-only and must not affect prerender.
- Unknown area/country/station routes must return real 404 responses instead of soft-404 pages.
- Canonical origin is `https://radio.eplus.dev` unless explicitly overridden for a real production migration.
- Do not emit sitemap `lastmod` from CI filesystem mtimes; they are checkout times, not trustworthy content-update times.
- Keep BreadcrumbList + CollectionPage/ItemList + RadioStation structured data aligned with visible route content.
- Do not generate fake hreflang tags while i18n uses `strategy: "no_prefix"`; proper multilingual SEO requires distinct locale URLs.
- Do not invent Privacy Policy or Terms content merely to eliminate a 404. Use owner-approved content or remove the links.
- Do not add sitewide Header/Footer links to routes that do not exist; Nitro's prerender crawler will follow them and hard 404s should remain build failures.
- Route discovery must ignore non-catalog/asset-only directories under `public/radio`; a directory is not an area merely because it exists.

Regression guards:

- `tests/seo-page-foundation.test.mjs`
- `tests/seo-structured-data.test.mjs`

## CI and validation

Primary PR CI is `.github/workflows/build.yml`, currently named **CI**. It runs both unit tests and a full Nuxt prerender generation.

At minimum:

```bash
npm ci
npm test
npm run generate
```

For runtime/server deployment changes, `npm run build` can also be useful locally.

Data-sync PR validation intentionally avoids live provider calls.

## Security

- Never add API keys, tokens, passwords, cookies, or private credentials to README, AGENTS, project-context docs, issue bodies, or PR bodies.
- Treat credential-looking values in environment files as secrets even if they are already present in repository history.
- Documentation should name environment-variable keys, not copy their values.

## Durable-memory rule

When a bug or refactor reveals a project-wide rule that a future contributor/AI could accidentally break again, update `docs/PROJECT_CONTEXT.md` in the same PR.
