# Radio ePlus — Project Context and Architecture Decisions

Last updated: **2026-10-08**

This document is the durable technical memory for Radio ePlus. It records decisions and failure modes that are easy to lose when work is spread across GitHub PRs, chats, and multiple coding assistants.

For short operational rules, see [`../AGENTS.md`](../AGENTS.md).

## 1. Canonical project

- Repository: `ePlus-DEV/radio.eplus.dev`
- Production: `https://radio.eplus.dev`
- `ePlus-DEV/get-radio` is legacy PHP crawler/history only and is not the active application.
- A preview/testing hostname such as `https://new-radio.eplus.dev` may be used during rollout, but it is not the canonical public URL unless project configuration is explicitly changed.

## 2. Application stack

Current application architecture:

| Layer | Technology |
| --- | --- |
| Framework | Nuxt 4 / Vue 3 |
| Runtime | Node.js 24.15.0 |
| Styling | Tailwind CSS 4 |
| UI primitives | Nuxt UI 4 + Radio ePlus tokens (DaisyUI removed) |
| State | Pinia |
| Audio | Native HTML5 Audio + hls.js |
| Theme state | `@nuxtjs/color-mode` |
| i18n | `@nuxtjs/i18n` |
| Images | `@nuxt/image` |
| Search | Algolia |
| Icons | Lucide for Nuxt UI; Font Awesome Free for existing catalog views |
| SEO | prerendered radio routes + sitemap |

Exact versions belong in `package.json`.

## 3. Important project paths

```text
assets/css/main.css                  Theme tokens and shared visual utilities
components/AppHeader.vue             Global header
components/AppFooter.vue             Global footer
components/player/Player.vue         Main audio/HLS player
components/player/Queue.vue          Schedule/channel side panel
utils/radio-source-plan.mjs          Playback source/fallback ordering
utils/station-navigation.mjs         Previous/next station ordering
utils/station-schedule.mjs            Schedule URL/provider normalization
pages/[area]/[country]/[station].vue Station detail page
public/radio/world.json              World/country metadata
public/radio/<area>/<country>.json   Station catalog per country
public/img/<area>/<country>/         Local station artwork
data/world.ts                        Generated world metadata
scripts/sync-instant-audio.mjs       Radio-data sync
docs/instant-audio-sync.md           Sync design and safety model
tests/theme-consistency.test.mjs     Dark/light regression guard
tests/player-hls-startup.test.mjs    HLS lifecycle regression guard
tests/radio-source-plan.test.mjs     Source-plan regression guard
tests/station-route-lifecycle.test.mjs Station-router state regression guard
tests/station-schedule.test.mjs       Schedule-provider regression guard
.github/workflows/build.yml          Pull-request test + prerender workflow
.github/workflows/instant-audio-sync.yml Radio data sync/validation workflow
```

## 4. UI direction

The current Radio ePlus UI was reviewed site-wide rather than component-by-component.

The design direction is:

- dark navy/slate Radio ePlus surfaces;
- rose accent for live/primary actions;
- consistent cards, menus, badges, inputs and selects;
- responsive layouts that avoid fixed empty columns;
- Nuxt UI controls with Radio ePlus semantic colors;
- custom Radio ePlus semantic tokens for the actual product palette.

DaisyUI should **not** be allowed to become an independent visual theme that conflicts with Nuxt Color Mode.

### Player schedule/sidebar color rule

The player sidebar uses Radio ePlus structural surfaces for tabs and schedule rows. Rose is an accent/status color only.

- Do not use a full `bg-rose-500` fill for active schedule/channel tabs.
- Do not style the current schedule row like an error/alert block with a large rose-tinted surface.
- Use `--radio-surface`, `--radio-surface-soft`, `--radio-border`, and `--radio-text` for the main block.
- Use rose for small active dots, badges, left rails, and live indicators.

Regression guard: `tests/player-schedule-style.test.mjs`.

### Navigation controls

Breadcrumbs are route-semantic rather than placeholder-level based:

- area page: `Home > Area`;
- country page: `Home > Area > Country`;
- station page: `Home > Area > Country > Station`;
- only ancestors are links; the current crumb uses `aria-current="page"`;
- do not pass empty fake breadcrumb levels just to force a label.

The Back-to-top control is available on mobile and desktop after scrolling, and its arrow is an inline SVG rather than a Font Awesome dependency.

### Language, theme and overlay lifecycle

Nuxt UI `UDropdownMenu` binds to explicit Vue open state for theme and language.
Selection closes the menu before the preference/locale changes. Reka owns menu
roles, outside-click/Escape behavior, focus and collision-aware positioning;
route changes close the menu as well. Do not reintroduce CSS focus-only menus.

`UApp` provides translated component labels. Search and lyrics use `UModal`,
mobile navigation and player queues use `USlideover`, and the queue uses `UTabs`.
The `--ui-*` structural variables map to `--radio-*`; Nuxt Color Mode remains the
only theme owner. Nuxt UI installs Tailwind's Vite plugin, so do not register a
second instance. Fonts are disabled to retain the existing font and avoid a
new external font dependency. Lucide's small client icon bundle is generated
from the installed collection with `icon.clientBundle.scan`; `icon.provider`
is `none` so client-only controls also work without an external icon API.

## 5. Dark-mode architecture

### Problem that existed

Dark mode previously depended on three independent mechanisms:

1. Tailwind `dark:`;
2. legacy DaisyUI `data-theme`;
3. manually hard-coded light/dark colors per component.

This produced pages where most of the UI was dark but individual controls, menus, select elements, overlays, or legacy components stayed light.

### Current solution

`assets/css/main.css` is the source of truth for structural colors.

The theme defines semantic variables for both light and dark modes, including values such as:

- `--radio-page-bg`
- `--radio-surface`
- `--radio-surface-elevated`
- `--radio-surface-soft`
- `--radio-surface-muted`
- `--radio-artwork-bg`
- `--radio-hover`
- `--radio-border`
- `--radio-border-strong`
- `--radio-text`
- `--radio-text-muted`
- `--radio-inverse-bg`
- `--radio-inverse-text`
- `--radio-track`
- `--radio-overlay`

The previous DaisyUI `--color-base-*` duplicate palette was removed; Nuxt Color Mode and `--radio-*` tokens are the source of truth.

Nuxt Color Mode drives the semantic tokens; avoid adding a second theme system.

The background/text are also applied at the root/document level so portals, dialogs, empty page regions, and browser-rendered controls do not expose white gaps in dark mode.

### Theme anti-patterns

Avoid returning to site-wide patterns such as:

```text
bg-white + dark:bg-slate-*
text-slate-* + dark:text-white
border-slate-* + dark:border-white/*
hard-coded structural hex colors inside Vue templates
```

Status colors such as rose/amber/emerald are intentional and are not the same as structural theme colors.

Regression test:

```text
tests/theme-consistency.test.mjs
```

## 6. Audio player architecture

### Historical change

The application previously used Video.js. It was replaced by Native HTML5 Audio + hls.js.

Do not casually revert to Video.js just because older commits contain a working implementation. If a reversion is proposed, compare bundle size, HLS behavior, mobile/Safari behavior, CORS, fallback logic, and maintenance cost first.

### Current playback flow

1. Build ordered playback candidates from station metadata.
2. Deduplicate URLs.
3. For HLS:
   - prefer hls.js when `Hls.isSupported()`;
   - use native HLS only if hls.js/MSE is unavailable;
   - attach media;
   - load the HLS source;
   - wait for HLS manifest/media readiness before attempting playback.
4. For plain audio streams, use the native `<audio>` source path.
5. Recover bounded HLS network/media failures when possible.
6. Advance to the next candidate only when the current candidate actually fails.
7. Stop after the global retry budget.

### Current track vs. Up next

The main artwork/title/artist area is the player's **single current-track presentation**.

A previous redesigned-player regression rendered `song.currentMedia` again below the transport controls under another "Now playing" label. That duplicated the same title/artwork twice.

Current rule:

- main metadata area = current track;
- do not repeat `currentMedia` in a secondary strip;
- if the provider returns `song.nextMedia`, the secondary strip can display it as `panel.next`;
- Zing program detail is known to expose `nextMedia`;
- generic Webrad-style playlist arrays must not be assumed to contain future tracks because they can represent current/history data;
- if there is no trustworthy next track, omit the secondary strip.

Player color hierarchy:

- structural surface/background = Radio ePlus theme tokens;
- rose = primary Play/Pause, Live and small current/next accents;
- emerald = playback status such as On air;
- avoid large competing rose + cyan split gradients in light mode.

Regression guard: `tests/player-now-playing.test.mjs`.

### Previous / Next station navigation

The main transport controls include Previous and Next station actions.

- These controls navigate the current country station list, not the current station's stream/source fallbacks.
- Navigation wraps around: Previous on the first station selects the last, Next on the last selects the first.
- If the current station is temporarily missing from the list, Next falls back to the first station and Previous to the last.
- Changing station follows the same autoplay path as selecting a station from the sidebar.
- The target station name is included in the button title/ARIA label.
- Station-order selection belongs in `utils/station-navigation.mjs`.

Regression test: `tests/station-navigation.test.mjs`.

### Critical HLS regression discovered on 2026-10-08

Regression page:

`https://radio.eplus.dev/asia/viet-nam/edm-radio-zing-mp3`

Observed symptom in the redesigned player:

- DevTools showed `.m3u8` requests continuing successfully;
- the UI still reported `6/6` and “stream cannot play”;
- the source selector exposed an auto-generated “Primary · HLS · Proxy” candidate even though the catalog only defined a direct HLS source.

Root causes:

1. Chromium may report a positive/“maybe” result for `canPlayType(...mpegurl)`, but that must not be treated as proof that native HLS is the best engine for the current stream.
2. The player attempted `media.play()` too early, immediately around HLS attachment rather than waiting for manifest/media readiness.
3. Early media/HLS errors could both schedule retries.
4. The source planner generated a generic CORS-proxy duplicate for an HLS manifest.
5. The fallback probe was aggressive enough to switch away while the HLS pipeline was still starting.

Fixes now considered architectural rules:

- hls.js/MSE first;
- native HLS only as fallback;
- no immediate `play()` directly after `attachMedia()`;
- wait for `MANIFEST_PARSED`/readiness;
- HLS.js handles HLS recovery;
- do not duplicate retry scheduling from raw media errors while hls.js owns the MediaSource;
- current startup probe window is 10 seconds;
- no automatically generated generic-proxy variant for HLS manifests;
- explicitly proxied catalog sources remain supported.

Regression tests:

```text
tests/player-hls-startup.test.mjs
tests/radio-source-plan.test.mjs
```

## 7. CORS and fallback-source policy

There are two different concepts that must not be confused.

### Explicit catalog proxy

A radio entry can be marked `cros: true`.

That means the application intentionally constructs a proxied URL using the configured CORS service before the source reaches the player.

This behavior must remain supported.

### Automatic fallback proxy

`utils/radio-source-plan.mjs` can generate a proxy fallback for suitable direct streams.

Current rule:

- plain audio streams can receive an automatic proxy fallback;
- HLS manifests should not receive a generic automatic proxy duplicate.

Why: an HLS master/media playlist can reference relative child playlists, keys, and media fragments. A generic proxy wrapped around only the top-level manifest can break those child requests.

## 8. Retry behavior

`MAX_STREAM_ATTEMPTS` is defined centrally in `utils/radio-source-plan.mjs`.

The retry budget is global/bounded. It should represent meaningful playback attempts, not every harmless intermediate HLS event.

Do not reset/consume the budget merely because a manifest starts downloading. Successful playback is the meaningful recovery point.

The UI may display the current exhausted count, so changing retry semantics also changes user-visible behavior.

## 9. Station data model

Country station files live under:

`public/radio/<area>/<country>.json`

Typical primary fields:

```json
{
  "station-slug": {
    "title": "Station name",
    "type": "audio/mpeg",
    "url": "https://station.example",
    "cros": false,
    "stream": "https://stream.example/live.mp3",
    "features": "/img/europe/example/station-slug.png",
    "favorite": false
  }
}
```

Some stations can also include:

- `streams` — ordered fallback candidates;
- `stream_alternative` — legacy alternative stream;
- `schedule`;
- provider-specific metadata.

Do not destructively replace existing stations merely because a sync provider returns a different result.

## 10. Persistent playback, catalog routing and realtime providers

The selected station has an application lifetime. `stores/playback.ts` owns its
identity, stream sources, station queue, and explicit play/pause requests.
`components/player/Session.vue` stays outside `NuxtPage` in `app.vue`; the audio
element, HLS instance, volume and pending recovery survive normal navigation.

Pages still load local catalogs during SSR/prerender for station names, links,
404s and structured data. They pass the same catalog to `PanelStation` and
shared playback. Home/country defaults use `onlyIfIdle`, so browsing does not
replace an active station. Opening a station route selects it; revisiting the
same URL or changing language leaves its source identity intact. Previous/Next
and queue selections remain explicit autoplay actions. Pausing records the
paused preference so a new page does not resume playback.

`useStationRealtime.ts` owns schedule/current-song/lyrics polling. It follows
the playback identity, not the route. A new station aborts pending requests,
clears metadata and lyrics, and closes the lyric dialog. `station-polling.mjs`
also verifies a generation because an aborted provider may still return data.
Polling begins after mounting and never runs during SSR/prerender. Normalize
schedule URLs before use and detect Zing from its provider endpoint, not country.

### Hydration rule

The app shell renders before async station-page setup can seed Pinia during SSR.
Rendering a global player at that point can serialize an empty/disabled player,
then leave stale DOM attributes when hydration sees the seeded station. The
player is therefore mounted once inside `ClientOnly`, with a fixed-height
fallback. Main content's queue spacing waits for mounting too. Indexable catalog
content and all page metadata remain server rendered.

The shell and Back to top reserve `--radio-player-height` plus the bottom safe
area. At wide desktop widths the queue is teleported into a dedicated column
inside `.radio-app-content`. Its sticky panel stops at the content boundary
before the footer, with a viewport-height limit and internal list scrolling.
Keep the shell/body horizontal overflow set to `clip`: `hidden` creates a scroll
container that prevents viewport sticky positioning. Smaller screens use a
Nuxt UI drawer with focus containment. The audio session remains outside
`NuxtPage`; moving the visual queue must never remount it.

A late native play promise is also version-checked. Pausing while connecting
must not be undone when an older `play()` promise later resolves/rejects.

Regression checks: playback-store and station-polling unit tests, the SSR guard,
and the Playwright suite against generated output. The suite uses a local AAC
HLS fixture and deterministic media/provider mocks, so CI has no live stream
availability requirement.

## 11. Data sync

Radio sync is documented separately in `docs/instant-audio-sync.md`.

Important principles:

- sync changes go through PRs, not direct `main` writes;
- missing countries can be added;
- existing countries are augmented non-destructively;
- local artwork is preferred;
- changed data is validated;
- upstream APIs can rate-limit, block, or change without notice;
- PR validation must not depend on live upstream providers.

The workflow name exposed in GitHub Actions is **Radio data sync**.

## 12. Search, SEO and canonical URLs

Detailed SEO architecture and the current audit live in [`SEO.md`](./SEO.md).

Current foundation:

- production canonical origin: `https://radio.eplus.dev`;
- radio hierarchy is prerendered;
- country pages expose station links during SSR rather than waiting for client JavaScript;
- unknown area/country/station URLs return 404 rather than soft-404 content;
- sitemap avoids synthetic `lastmod` until a trustworthy content timestamp exists;
- JSON-LD coverage includes WebSite, Organization, BreadcrumbList, CollectionPage/ItemList, and RadioStation as appropriate;
- realtime schedule/song/lyric APIs remain client-only and are excluded from crawl-time dependencies.

Known SEO limitation:

1. i18n still uses `strategy: "no_prefix"`, so true multilingual hreflang SEO requires a dedicated URL migration.

Prerender hard-404 regression fixed on 2026-10-08:

- Header/Footer previously linked to static routes before those pages existed, and Nitro correctly failed when its prerender crawler followed the 404s;
- the site now has real `/about`, `/statistics`, `/contact`, `/privacy-policy`, and `/terms-of-use` pages;
- those routes are explicitly prerendered, included in the sitemap, and restored in site navigation;
- static-page copy is localized under `site_pages` for every configured locale;
- `/statistics` uses catalog counts calculated at build time by `build/radioStats.ts`, not hard-coded totals;
- `build/radioRoutes.ts` ignores asset-only folders under `public/radio`;
- legacy Romania artwork was moved from `public/radio/romania/` to the canonical `public/img/europe/romania/` tree so it can no longer masquerade as a geographic area.



Production canonical URL:

`https://radio.eplus.dev`

The application generates radio SEO routes/sitemap from repository data.

When working on previews, do not accidentally change canonical production metadata to a temporary preview domain.

Algolia is optional for local/build scenarios where credentials are unavailable.

## 13. Internationalization and RTL

Configured languages include English, Vietnamese, Japanese, Simplified Chinese, Traditional Chinese, French, and Russian.

Station/provider text can include languages not represented by the site UI locales, including Arabic.

For dynamic station names/descriptions:

- prefer `dir="auto"`;
- avoid assumptions about Latin text width/direction;
- test long names and RTL names in player/sidebar/card layouts.

## 14. Font Awesome state

The visible application UI is **Font Awesome Free-only**.

The 2026-10-08 icon audit moved the remaining UI uses away from Pro-only icons, centralized registration in `config/fontawesome-icons.mjs`, removed `proIcons` configuration, and removed direct Pro/Sharp Font Awesome package dependencies.

Important rules:

- all `fas`/brand icons used by Vue templates must be registered centrally;
- Nuxt UI theme and player controls use locally bundled Lucide icons;
- the lyric action uses Free Solid `music`;
- the offline state uses Free Solid `wifi`;
- the Back-to-top control uses an inline SVG so this critical navigation action cannot render blank because of an icon-registry regression;
- private Font Awesome registry auth tokens must never be committed.

Regression test: `tests/fontawesome-icons.test.mjs`.

## 15. Testing and CI

`npm test` runs Node test files in `tests/*.test.mjs`.

Important current guards:

- `theme-consistency.test.mjs`
- `language-dropdown.test.mjs`
- `player-hls-startup.test.mjs`
- `radio-source-plan.test.mjs`
- `station-navigation.test.mjs`
- `station-route-lifecycle.test.mjs`
- `station-schedule.test.mjs`
- `station-realtime-ssr.test.mjs`
- `radio-sync.test.mjs`

Pull-request workflow:

`.github/workflows/build.yml`

Its current GitHub Actions display name is **CI** and it runs `npm test` followed by `npm run generate`.

The prerender step catches SSR/generation failures, but automated checks are still not a substitute for manually validating:

- desktop/mobile layout;
- light/dark mode;
- one MP3/plain stream;
- one HLS stream;
- a country with stations but no schedule;
- a station with schedule;
- Arabic/RTL station text;
- search/dialog/dropdown surfaces.

## 16. Security/documentation rule

Do not paste secrets into durable docs.

Environment documentation should list variable names and purposes only.

Do not commit private npm registry tokens. A previously committed Font Awesome registry token in `.npmrc` was removed during the Free-only icon migration and must be revoked/rotated outside the repository.

If an environment/example file contains credential-looking values, treat them as sensitive and do not repeat them into README, AGENTS, issue bodies, PR bodies, or AI prompts.

## 17. How future AI/contributors should update this file

Update this document in the same PR when any of the following changes:

- framework/player/theme architecture;
- canonical URLs;
- stream fallback/CORS policy;
- important provider limitation;
- CI/test expectations;
- data schema;
- sync safety rules;
- icon/licensing strategy;
- a production regression reveals a new rule that future refactors must preserve.

Prefer documenting the **reason** for a rule, not only the final code, so later refactors do not accidentally recreate the same bug.


## 18. Nuxt development tooling compatibility

Nuxt devtools still imports the removed default export from Simple Git 4, while
the repository pins Simple Git 4 for security. Devtools is disabled so `nuxt dev`
remains usable without weakening that override. Re-enable only after devtools
supports the named export. This does not affect the product or production build.

## 19. Listening continuity and reload silence

`stores/listening.ts` owns local recent/favorite lists, the last station identity,
and the last explicit Play/Pause preference. Recent history is added on actual
playback, not when browsing a station. Persist display identity only; restore
stream sources from the current catalog rather than storing stale/proxied URLs.
Corrupt or unavailable localStorage must leave playback usable in the session.

Every fresh page stays silent, even if the previous session was playing or the
legacy `radio_autoplay_enabled` flag was set. Restore the last station on general
pages, but respect a station deep link and any new user action while restoration
is pending. Explicit selection from the listening lists requests its target
station, not the previous station while the target catalog is loading.

The sleep timer follows the global player lifetime and uses a wall-clock deadline.
It rechecks on visibility/pageshow, cancels on explicit pause, and does not survive
reload. OS background suspension can delay the browser callback until wake.

Country counts are part of build-time `radioCatalogStats.byCountry`; never fetch
all country catalogs solely to count stations. Search shares a successful static
index across modal opens and prepares normalized fields once per immutable array.
Remote search results must match the current input generation.

At the owner's request, Playwright CI steps are temporarily opt-in with repository
variable `ENABLE_BROWSER_TESTS=true`. Keep unit/prerender/noindex checks enabled.
See `UI_ROADMAP.md` for the current follow-up priorities.
