# ePlus OnAir — Project Context and Architecture Decisions

Last updated: **2026-10-08**

This document is the durable technical memory for ePlus OnAir. It records decisions and failure modes that are easy to lose when work is spread across GitHub PRs, chats, and multiple coding assistants.

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
| UI primitives | Nuxt UI 4 + ePlus OnAir tokens (DaisyUI removed) |
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

The current ePlus OnAir UI was reviewed site-wide rather than component-by-component.

The design direction is:

- dark navy/slate ePlus OnAir surfaces;
- rose accent for live/primary actions;
- consistent cards, menus, badges, inputs and selects;
- responsive layouts that avoid fixed empty columns;
- Nuxt UI controls with ePlus OnAir semantic colors;
- custom ePlus OnAir semantic tokens for the actual product palette.

DaisyUI should **not** be allowed to become an independent visual theme that conflicts with Nuxt Color Mode.

### Player schedule/sidebar color rule

The player sidebar uses ePlus OnAir structural surfaces for tabs and schedule rows. Rose is an accent/status color only.

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

- structural surface/background = ePlus OnAir theme tokens;
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
replace an active station. Opening a station detail from a card, search result,
favorite, recent history or other link never starts playback or replaces the
already selected station. On a fresh deep link with no current station, the
station may be prepared while remaining paused. Only an explicit Play control
(detail, featured/country/library card, global player, or Resume) starts audio.
Previous/Next and selecting a station from the player queue are explicit player
actions and still switch/play the requested station. The player session marks
these actions through `requestStation` before navigating; the detail watcher
consumes only a matching request (or prepares an idle player). Never reintroduce
an unconditional route watcher that activates a station while another is playing.
Revisiting the same URL or changing language keeps the source identity intact.
Pausing records the paused preference so a new page does not resume playback.

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

Nuxt 4.6.3 and DevTools 3.4.4 no longer require the vulnerable `simple-git`
3.x dependency. The old `simple-git: 3.36.0` override was removed after a
Critical security advisory. Keep `devtools: { enabled: true }` and verify that
the resolved lockfile contains no `simple-git` dependency. Do not restore the
legacy override to address a future tooling issue; upgrade the compatible
upstream dependency instead. CI runs a high/critical production npm audit.

Nitro 2.13.4's string externals rules never match Windows module ids that use
backslashes (nitrojs/nitro#4732, nuxt/nuxt#36467). Without a workaround, the
Nuxt server renderer is left external, native Node resolves
`nuxt/internal/manifest` to a stub, and every SSR page fails with
`Error (500): Either manifest or precomputed data must be provided` on Windows
(dev and local builds; Linux CI is unaffected). `nuxt.config.ts` therefore adds
separator-agnostic regex `nitro.externals.inline` rules for `nuxt/dist` and
`@nuxt/nitro-server/dist`. Remove them once the installed Nitro release
includes the upstream fix.

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

## 20. App layout and personal library

The app redesign uses a compact discovery header, violet navigation, a resume
card, personal favorite/recent grids, compact country rows, and a mobile bottom
navigation. `/library` is prerendered but excluded from the public sitemap;
its device-local content is client-only and its page is always noindex.

`PlayerNowPlaying` is presentation only. The existing persistent `Player` owns
one native audio element and all source/retry/session logic. Opening the modal
hides the compact dock without unmounting the audio. Queue/lyrics open after the
full player exits so their focus traps do not overlap. Mobile navigation and
player heights are reserved in the page/footer together with the bottom safe area.
No elapsed/remaining seek bar is shown for live radio. Next track is shown only
when supplied by the provider; otherwise the UI explicitly labels next station.


## Separate website and station image releases (2026-10-13)

GitHub Pages limits the complete published website to 1 GB; smaller Git pushes
cannot bypass that. Production HTML plus 4,228 generated station share JPEGs
exceeded the budget. Pages CI and publishing now use `npm run generate:site`
with `ONAIR_SKIP_STATION_OG=true`. Existing station logos, favicons and the
shared brand PNG remain available; only generated station OG JPEGs are omitted.
The generator deletes stale local `public/og/stations` output in this mode.

`npm run generate:images` still generates station JPEGs **locally**. The
legacy manual uploader `publish-station-images.yml` was retired on 2026-11-06:
the Actions run history showed no usage, and neither Pages repository had a
`station-images` branch. Keep `scripts/publish-image-batches.mjs` and its tests
as offline reference tooling, but do not claim station-image upload automation
is active. Normal Pages builds use the shared PNG; the external manifest audit
must reject incomplete image sets.

Only activate `STATION_OG_BASE_URL` if the image set and a complete verified
manifest are **already** published to a stable immutable HTTPS location.
Otherwise keep that variable unset and the 1 GB website audit enabled.
Reintroducing an uploader requires a demonstrated use case, explicit review
and regression coverage; never replace production metadata/canonical policy
as part of a workflow cleanup.

## One repository workflow at a time (2026-10-13)

CI, Pages website deployment and manual InstantAudio sync all
use workflow-level concurrency group `onair-repository-work`, with
`queue: max` and `cancel-in-progress: false`. Groups based on PR number,
branch, target or workflow name do not enforce a repository-wide limit.
Do not restore those separate groups. Never give child jobs the same lock as
their parent workflow: that can deadlock a workflow holding the shared lock.

Distinct queued work is preserved, rather than silently replacing another
PR's required CI or a pending production deployment. When a queued CI run
starts, its preflight skips closed PRs and superseded head commits before
Node setup, installation and tests. Website deployment similarly skips an old
branch commit before generating or publishing files. The next current run
performs the normal checks. An active website deploy or data-sync job finishes before the next
workflow starts. Previously dispatched runs retain their old concurrency
configuration until completion.

## Playback reliability follow-up (2026-10-18)

- `waiting` clears actual-playing state; only the media `playing` event restores it. Network `stalled` must not clear playing when readyState still has future buffered data.
- Volume/mute preferences use `radio:audio-preferences:v1`, restored before volume listeners, with guarded storage and range validation. iOS system volume is never assigned programmatically. Preferences never authorize autoplay.
- Metadata polling skips offline and hidden idle sessions, but continues for visible schedules and background playback. Successful lyrics are cached by media ID (20 entries); failed requests remain retryable.

## Listening tools and portability (2026-10-28)

Favorites export uses `eplus-onair-favorites` version 1 with station paths only.
Import rejects malformed/version-mismatched files, limits input to 256 KiB and
200 entries, and resolves identities against the current static search catalog.
Never trust imported names, images, streams or playback preferences. Preview
recomputes when local favorites change; confirmation merges without toggling
existing entries or touching history, selected station or play/pause intent.
The import dialog is mounted on demand so visiting the library does not add a
search-index request. Queue favorites filtering affects presentation only;
Previous/Next still use the original station order.

Station sharing always uses the canonical production page without query or
autoplay parameters. Native sharing falls back to clipboard then manual copy;
a cancelled share does not copy or report success. A browser-blocked Play requires
another explicit Play/Retry; generic pointer/key events must never unlock audio. Reporting opens a GitHub
issue draft with station page, name and a coarse failure category only. It
never submits automatically or includes stream URLs, history or credentials.

Playback recovery distinguishes offline, connecting/buffering, unsupported or
undecodable last source, and exhausted retries. The existing bounded HLS/native
recovery owns the lifecycle; status UI must not start an independent retry loop.
Retry after a terminal error starts a fresh attempt budget even from Play.
The dock recovery card floats above the existing dock so shell height and safe
areas do not change; fullscreen and mini player show the same recovery actions.

## CodeQL security invariant — external metadata and publishing checks (2026-11-02)

- Third-party radio station titles/headings are always **plain text**, never trusted markup.
  Use `stripMarkupToText` from `utils/markup-text.mjs`; do not restore
  regex-based tag filtering such as `/<[^>]+>/` or script/style regex stripping.
  This is a text extractor, **not** an HTML sanitizer; do not pass its result to
  `v-html`, `innerHTML` or other HTML sinks.
- Decode HTML/XML text entities in **one pass** with `decodeTextEntitiesOnce`.
  In particular `&amp;quot;` must become `&quot;`, not a quotation mark;
  otherwise nested decoding can turn text into markup.
- Sitemap validation must decode `<loc>` entries once, then validate with
  `new URL()` and strict canonical `origin`, query and hash checks.
- GitHub Pages policy tests should detect a forbidden **full hostname**,
  not rely on partial URL substring comparisons.
- Regression guard: `tests/markup-text-security.test.mjs`. Keep CodeQL and
  required npm audit checks enabled; a successful CodeQL workflow only means
  the analysis completed, not that the Security alert backlog is empty.


## 2026-11-02 — Listener Settings and live-radio resume

User preferences live in `stores/listenerPreferences.ts` and
`utils/listener-preferences.mjs` under `radio:listener-preferences:v1`.
These settings are local to each browser, validated against a five-boolean
schema with safe defaults, and synchronized between tabs using the `storage`
event. They **do not overwrite or migrate** existing independent keys for
favorites, recently played, audio volume, theme, locale, listening statistics,
or the cookie notice. Blocked localStorage is not a playback failure.

Settings are reachable at `/settings` in Header and Sidebar. The page
is statically prerendered but `noindex`, and is intentionally omitted from
the production sitemap. Its translations must stay complete across all seven
locales. Listener-specific information is hydrated on the client to avoid
embedding private data in static HTML.

The player remains mounted globally outside `NuxtPage`. `resumeLive`
defaults to true: only after an explicit Pause and subsequent Play on an
existing linear stream, it discards buffered MP3/AAC and native-HLS playback
by reapplying the active source (resolving .pls/.m3u again). With hls.js,
a finite `liveSyncPosition` can be used only if it is within the last valid
seekable window; otherwise the active HLS source/manifest is reloaded. Do not
seek on new station selection, on page reload, or beyond the available
window. Reuse the existing bounded fallback/retry logic and never
automatically play on a browser reload.

`autoReconnect` controls automatic playback fallback/recovery. When off,
network/media errors become user-retryable instead of initiating endless
background attempts. `restoreStation` controls restoring the previously
selected station without ever auto-playing. `rememberVolume` gates reading
and writing the preexisting volume key without deleting it. `reduceMotion`
adds the opt-in class `radio-reduce-motion` to the document root; it does not
override the browser's own motion accessibility controls.

The listening-duration toggle remains a separate opt-in/out for LOCAL
statistics only and **does not disable GA4 analytics**. Do not call the
informational cookie banner "tracking consent". Destructive controls for
recent listening history and local statistics must require confirmation
and preserve favorites.

Regression tests: `tests/listener-settings.test.mjs`, existing
`tests/player-hls-startup.test.mjs` and player/SEO tests. Keep
`npm test`, `npm run generate`, and CodeQL CI green before merging.


## 2026-11-02 — Online presence time versus listening duration

**Online time is not radio listening time.** Online presence is a local-only
metric measured by `composables/useOnlinePresence.ts`, mounted **once** in
`app.vue`, independently of `PlayerSession`. It counts while this
browser tab is **visible, foreground/focused and connected**; it does not
require playback. Audio may keep streaming in the background without
increasing online presence. Idle for five minutes stops online counting
until actual user interaction or returning focus. Visibility, focus, blur,
online/offline, pagehide and user activity events maintain the timer.

`utils/online-duration.mjs` defines a monotonic-clock checkpoint tracker,
bounded to 15 seconds per checkpoint to avoid sleeping/tab-suspension clock
jumps. It uses the existing midnight-safe local-day splitter and 365-day
retention limit, but stores online totals in distinct keys:
`radio_online_duration_v1` and
`radio_online_tracking_enabled_v1`. Audio listening data stays in
`radio_listening_duration_v1` and existing station history/favorites
are untouched. Never mix the two metrics or silently infer online
duration from media play time or playback duration from page presence.

Both local tracking switches are independent and may be disabled separately
in Settings. The Listening Statistics view links to Settings rather than duplicating privacy switches. GA4 analytics remain a
**separate** concern. Deleting time statistics confirms intent and clears
both local online and listening totals, resetting pending checkpoints
without restoring the deleted interval. Daily graphs select Online or
Listening rather than double-stacking the two and implying their totals
are disjoint. Values apply to this browser only; no authenticated account
or cross-device sync is offered.

Regression coverage: `tests/online-duration.test.mjs` plus existing
`tests/listening-duration.test.mjs`. Keep translations and privacy
copy accurate for all seven locales.



## 2026-11-03 — Reading online vs listening time in the UI

The Library stats page visually separates two independent measures:
- **Listening** has the rose accent and headphones icon; includes background audio when playing.
- **Online** has the emerald accent and browser icon; counts only visible/focused/active site use.
- Each metric retains separate lifetime/today cards, but daily history is shown
  in **one combined interactive SVG chart** with two distinguishable lines.
  The lines have intentionally **independent scales**, because a brand-new
  online counter and years of listening totals may differ drastically.
  Show each scale's maximum in matching colors and explain this explicitly;
  never imply the same y-axis units/scale or stack/add these overlapping times.
- Filters support **Both**, **Listening only**, and **Online only** with shared
  7/30/90-day ranges. Hovering a point shows a date and actual durations in a
  tooltip; pointer/touch, keyboard left/right, and a separate accessible day
  slider allow inspecting values on mobile or without hover. Invalid/zero data
  must remain legible and must not manufacture duration values.
- Preserve existing localStorage data, independent tracking toggles, and the
  explicit confirmation before clearing statistics. Keep all seven locales aligned.

The trend geometry is a dependency-free helper at `utils/activity-trend.mjs`,
covered by `tests/activity-trend.test.mjs`. Empty and invalid data must remain
legible. Do not confuse relative chart height with comparable absolute quantities.


## 2026-11-03 — P1 client-load optimizations (Issue #328)

The header's `SearchBox` mounts on every route (even when hidden by CSS
on mobile), but must **not** fetch the full `search/stations.json` on mount.
`useStationSearchIndex` exposes an explicit `load()` action and uses
`createCachedLoader` to share one in-flight or successful download across
header/modal instances. Invoke it on user search focus/open; failures must
remain retryable, with the same offline/Algolia fallback behavior and recent
history. Avoid evaluating local rankings while the inline search is closed.

`CountryMarquee` uses `observeCountrySize` to share one ResizeObserver
between all cards instead of creating one observer and window resize listener
for every station/country label. The one-listener fallback covers browsers
without ResizeObserver. Overflow names remain accessible via title/tooltips;
marquee animation is paused by default and runs only on hover/focus.
Respect reduced-motion settings and clean up observers on unmount.

Regression guard: `tests/performance-ui.test.mjs`. These are structural
improvements; record DevTools/Lighthouse metrics before claiming quantified
LCP/INP savings. Preserve the globally mounted radio player, station data,
static SEO output and existing color tokens.

## 2026-11-04 — Compact Listening dashboard redesign (supersedes 2026-11-03 layout)

The route `/library#stats` uses the **real** local statistics, never sample data. The chart/ranking adjacency described below is superseded by the newer 2026-11-04 dynamic station ranking decision.
The previous two headline + four miniature KPI arrangement was redundant and
visually crowded, especially beside the desktop player queue.

- **One row of four KPI cards:** lifetime Listening, lifetime Online, distinct
  stations listened to, most-listened station. Today and any genuine 7-day
  comparison are small secondary labels within the first two cards. When
  there is no prior-week baseline, show actual current-week duration rather
  than an invented `0%` growth value.
- **Balanced insights grid:** the combined daily chart shares a row with the
  per-station ranking when the *content container* is at least 760px wide,
  independent of viewport width or the presence of the queue/sidebar.
  Under that width, both sections stack; KPI cards become 2x2 on mobile.
- **One chart:** keep two *independently scaled* series (rose listening,
  teal online), real data, hover/touch tooltip, Both/Listening/Online and
  7/30/90-day filters, keyboard arrow navigation and an accessible native
  range slider nested in a disclosure to reduce default visual clutter.
  A small peak summary replaces the former four-column subdashboard.
- **Ranking:** one compact row per station with artwork fallback, real
  duration, actual share of total ranked listening time and a matching-width
  progress bar (never 100% bar for a station labeled 49%). Retain View all
  and Show less for more than five stations.
- **Privacy controls and destructive actions:** remain functional and
  confirmable at `/settings`; the dashboard has an obvious Settings link
  instead of duplicated switches and a second deletion control. Tracking
  and chart state must never be coupled to appearance.
- **Design constraints:** use semantic `--radio-*` tokens, subtle borders
  and solid accents (no heavy card glow), proper light/dark contrast and
  reduced-motion handling. The audio session remains mounted globally
  outside `NuxtPage`; no route, localStorage key, saved preference, favorites,
  station data, metadata or sitemap behavior should change.

Guard with `tests/library-stats-design.test.mjs`,
`tests/activity-trend.test.mjs` and `tests/online-duration.test.mjs`.
Responsive smoke tests: 320/375/390/430px and constrained desktop
with queue open/closed, plus 1440px light/dark and touch/keyboard.

## 2026-11-04 — Dynamic station ranking and independent chart layout

Supersedes the earlier side-by-side chart/ranking grid: a variable-size list
must **not** determine the chart's height or create a tall, uneven column.

- The combined Listening/Online chart takes the full central content width;
  its height remains predictable regardless of station count. Preserve
  actual values, independent scale labels, hover/touch/keyboard inspection,
  and 7/30/90-day filters.
- A separate compact **Top 3** section sits below the chart. Render only
  existing station records: zero stations show a compact empty message;
  one or two stations show only those cards without dummy placeholders or
  forced tall empty cards; 3+ stations show up to three. Cap a card's width
  to avoid oversized single-station displays. Responsive wrapping must
  respect the content column with or without the player queue.
- A "View all" control appears only when there are **more than three**
  stations. It opens a Nuxt UI dialog, not an in-page unbounded expander.
  Search is case/accent-insensitive, sorting offers most listened, least
  listened and A–Z, and pages contain at most **10 stations**.
  Clamp out-of-range pages when filtering or data changes. Use real local
  listener duration records and do not mutate persisted arrays.
- The progress bar and text use the exact same denominator (all saved
  ranked listening duration), even when showing only Top 3 or a filtered
  modal. Keep artwork fallback, station navigation, keyboard operability
  and focus management through the Nuxt UI dialog.
- Localize controls in all seven supported languages and regression-test
  0/1/2/3, 20+ entries, filtering, page boundaries and sort order.
  No player, localStorage key, user preferences, SEO or sitemap changes.

## 2026-11-03 — Preserve More and informational pages on phones

The phone bottom navigation (`<640px`) must include four actions:
Discover, Search, Library, and **More**. More opens the same `USlideover`
owned by `AppHeader`; both components share the Nuxt `useState` key
`radio:mobile-navigation-open`. Route changes, Escape and the slideover close
interaction dismiss the menu. Do not replace More with a Settings shortcut:
Settings is a destination **inside** the navigation, not a substitute for
navigation.

The mobile-only `AppSidebar` Information group exposes all live public
site pages already linked from the footer: About, Statistics, Contact,
Privacy Policy, Terms of Use, and Cookie Policy. A separate Settings link is
placed at the bottom of this group; all page links remain navigable, and
the expandable region list follows them. Hide the standalone Settings gear
on narrow phones to make room, but retain tablet/desktop controls.

Make this behavior accessible (clear text and icons, touch targets, active
page state, 320px and dark/light modes) and translated into all seven locales.
Regression coverage lives in `tests/mobile-more-navigation.test.mjs`.
Do not touch PlayerSession or the global audio dock for navigation fixes.

## 2026-11-04 — Library sidebar grouping and portal-safe station dialog colors

- Desktop sidebar and mobile More drawer show **one Library parent** with four
  expandable children: All, Favorites, Recently played, Listening time. Do not
  promote Library hash tabs into independent top-level navigation entries.
  Retain canonical `/library`, `/library#favorites`, `/library#recent`
  and `/library#stats` deep links, reload and Back/Forward behavior.
  Expand Library automatically while navigating to `/library`; the parent
  is a disclosure button with `aria-expanded` and labeled child navigation.
  The public `/statistics` page remains a separate destination.
- The Listening time **All stations** `UModal` is teleported to the document
  root, outside the Statistics page scope. Component-scoped CSS and
  route-scoped `--radio-*` values cannot reliably style its popup.
  Define semantic document-level modal colors in `assets/css/main.css` under
  both light/dark themes and apply a unique `radio-station-stats-modal`
  class to the Nuxt UI content. Inputs, ranking rows and artwork inherit the
  modal palette. Avoid hard-coding a default dark dialog surface that differs
  from the Statistics dashboard.
- Do not change persisted listening data, paging (10 per page), the native
  Nuxt UI modal focus/close behavior, player session, SEO URLs or sitemap.
  Regression guards: `tests/sidebar-library-navigation.test.mjs` and
  `tests/station-modal-theme.test.mjs`, in addition to existing design/SEO
  and mobile navigation tests.

## 2026-11-05 — GitHub Pages PR previews

- Never deploy PR preview files into staging (`onair-staging-pages`) or production (`onair-production-pages`): the staging main tree was ~962.8 MB when checked.
- Dedicated public output repo `ePlus-DEV/onair-pr-previews` uses the existing `PAGES_DEV_READY` variable and `PAGES_DEPLOY_TOKEN` to host `/pr-preview/pr-N/` after one-time owner setup; use the exact per-PR subpath in Nuxt build/asset origins.
- The `pull_request_target` workflow is trusted definition only. Building PR code happens in a read-only job with no secrets and no persisted checkout credentials; the deploy job never executes PR files, and verifies live PR status and SHA before publishing.
- Preview mode `ONAIR_PR_PREVIEW=true` limits prerender to representative pages and forces noindex/no GA4; normal staging and production generation, SEO text, sitemaps and analytics must remain unchanged.
- Delete only the closed PR directory, enforce combined output below 900 MB, and keep destination PAT access strictly scoped. See `docs/PR_PREVIEWS.md`.

## 2026-11-05 — Preview workflow rules

- Keep `pr-preview-pages.yml` on both `main` and `develop`. `pull_request_target` loads the workflow from default branch `main` while matching PRs aimed at `develop`.
- A preview runs on PR open/reopen/update, not on merge into `develop`.
- Publish a preview link only after the Pages endpoint serves the exact head SHA marker and `noindex` HTML. A successful push is not proof of a working website.
- Update a single bot comment, and remove the PR-specific preview after close. Smoke-test PRs such as #367 should be closed without merging.
- For small, explicitly authorized workflow or documentation fixes, commit directly when branch policy permits instead of creating unnecessary PRs. Keep product changes and sensitive CI changes subject to review.


## 2026-11-06 — Apple Music TuneIn CORS origin comes from environment

The Apple Music public TuneIn resolver must reuse Nuxt's `config.public.corsServer`
from `NUXT_PUBLIC_CORS_SERVER_1` instead of a hardcoded proxy hostname. Playback,
HLS renewal, and idle last-station restore share this value. Invalid or missing
config disables the public TuneIn route (no implicit Heroku fallback); an
independently configured provider-approved resolver can be used as a fallback.

GitHub Pages is static, so `deploy-github-pages.yml` must pass
`vars.NUXT_PUBLIC_CORS_SERVER_1` from the chosen development/production GitHub
Environment at build time. Regression coverage lives in
`tests/global-radio-public-tunein.test.mjs`. Preserve SEO content; never log
signed stream tokens or mistake lookup success for validated browser audio
or provider authorization.

## Three-tier GitHub Pages environment contract (2026-11-06)

See [ENVIRONMENTS.md](./ENVIRONMENTS.md) for the authoritative branch / GitHub Environment / Pages repository / hostname matrix and staged migration.

- **Development**: a same-repository feature PR targeting `develop`, built without deployment credentials and published by trusted jobs from the GitHub Environment `development` to `ePlus-DEV/onair-pr-previews` at `https://preview.radio.eplus.dev/pr-preview/pr-N/`. It is temporary and only a subset of static routes is prerendered; there is **no** persistent `dev` source branch by default. Preview `404.html` can countdown and redirect to a matching Production route, but this is HTTP 404 and never evidence that a preview deployed successfully.
- **Staging**: trusted `develop` releases to `ePlus-DEV/onair-staging-pages` at `https://new-radio.eplus.dev/`. GitHub Environment is `staging` **after** its own secret `PAGES_DEPLOY_TOKEN` and public `NUXT_PUBLIC_SITE_URL` have been configured and the **repository-level** `PAGES_STAGING_READY=true` variable is enabled. Until then, the legacy `development` Environment/`PAGES_DEV_READY` route stays active; setting the new staging flag to `false` explicitly disables Staging.
- **Production**: trusted `main` releases to `ePlus-DEV/onair-production-pages` at `https://radio.eplus.dev/` with GitHub Environment `production`. Only Production is indexable and may emit canonical/JSON-LD/sitemap and GA4 `G-ETDY41KBBJ`.
- Both Development and Staging are `noindex`, GA4-free and sitemap-free. Their hostnames also fail closed to `noindex` when the flag is missing. Production has `NUXT_APP_BASE_URL=/`; Staging has `/`; Development Preview has `/pr-preview/pr-N/`.
- Release direction is `feature PR → Development Preview → merge develop → verify Staging → reviewed develop-to-main release PR → Production`. Never merge or deploy PR content directly to Production, rewrite production SEO text as collateral work, force-push, or copy secret values into docs.
- The default branch `main` controls the `pull_request_target` Preview workflow; synchronize it with `develop`. Keep PR build jobs read-only and isolated from Environment secrets; verify live HTML `noindex` and expected PR SHA before the bot posts a working preview URL.
- Changes to any deployment tier must update `AGENTS.md`, `docs/ENVIRONMENTS.md`, `docs/GITHUB_ACTIONS.md` and tests, and preserve all three distinct Pages repositories and `CNAME` records.

## README documentation layout (2026-11-06)

The root `README.md` is intentionally a short public-facing project landing page, not the operational runbook. Keep product summary, quick-start, three-tier environment links, developer documentation index and license status visible without repeating deployment internals.

- `docs/DEVELOPMENT.md` owns local setup, scripts and source directory reference.
- `docs/ENVIRONMENTS.md` is the source of truth for branch / GitHub Environment / Pages repository / domain mapping, migration, deploy secrets and guardrails.
- `docs/GITHUB_ACTIONS.md`, `docs/GITHUB_PAGES.md`, `docs/PR_PREVIEWS.md`, `docs/SEO.md` and `docs/SEPARATE_IMAGE_RELEASES.md` own their respective detailed runbooks.
- Changes must update the specific document and keep README links working, rather than expanding README with duplicated tables, secrets guidance or YAML. Keep README and `AGENTS.md` synchronized between `main` and `develop`; do not alter production metadata, analytics, UI or deploy behavior for documentation restructuring.
