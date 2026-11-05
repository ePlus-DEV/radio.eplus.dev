# Radio UI and playback roadmap

## Implemented in this iteration

- Personal radio section on the homepage with recent stations and favorites.
- Recent history records actual `playing` events, removes duplicates, and keeps the latest 20 stations.
- Favorites can be toggled from the desktop player, mobile controls drawer, and personal radio lists. They persist in this browser without an account.
- Restore the last station using its current country catalog, including its current sources and queue. An explicit station URL takes precedence; a late restore cannot override a new user selection.
- Save the last Play/Pause preference for continuity, but **never use saved Play as reload autoplay permission**. A fresh page stays silent until an explicit playback action. This also ignores the legacy `radio_autoplay_enabled` flag.
- Live radio resumes the selected channel; there is no promise of resuming a historical song timestamp or DVR buffer.
- Sleep timer: 15, 30, 60, or 120 minutes, cancel action, and remaining minutes. It survives in-app route changes and cancels on explicit pause. It uses an absolute deadline and rechecks when the page resumes. A browser suspended by the OS may delay execution until it wakes; timers do not survive reload.
- Build-time country counts replace country-catalog request fan-out and remote count enrichment.
- Search loads its static index on demand, caches a successful request across modal opens, shares concurrent loads, and retries after a failure. Normalized searchable fields are prepared once per immutable catalog.
- While remote search is pending, show the local result for the current query. Late remote responses cannot replace a newer query.
- Larger header and transport targets, scrolling within the search modal/drawer, mobile input zoom prevention, and reduced-motion support.
- Remove the invisible one-second player clock and defer HLS module loading until playback needs it.
- Browser tests stay available but are opt-in in CI through `ENABLE_BROWSER_TESTS=true`. Unit tests, prerender, and staging noindex checks remain enabled.

## App redesign

- Compact discovery heading and search header; violet desktop navigation with favorite/recent shortcuts.
- Resume card and favorite/recent sections, with a dedicated noindex `/library` page and filters.
- Mobile Discover / Search / Library navigation beneath the persistent mini player.
- Fullscreen Now Playing with artwork, actual paused/playing status, transport, favorites, sleep timer, sources, lyrics and queue access; no fabricated live seek timeline.
- Presentation changes preserve one audio engine; provider next-song and next-station labels remain distinct.
- Compact country rows retain static discovery links and build-time counts. Artwork in personal/full-player views has a stable fallback.

## Follow-up priorities

| Priority | Improvement | Acceptance criteria |
| --- | --- | --- |
| Done | Stream health reporting | Visible offline/unsupported/exhausted states, retry/source actions and a user-submitted GitHub report draft; buffering remains non-terminal. |
| P1 | Real-device Safari/iOS review | Check background playback, headset/lock-screen actions, keyboard viewport, safe areas and reload silence on an iPhone. |
| P1 | Playback module extraction | Separate audio lifecycle, retry recovery, Media Session and UI from the large player component while preserving route persistence. |
| Done | Persist user volume/mute | Implemented on 2026-10-18; preferences never authorize autoplay and iOS retains system volume. |
| Done | Favorites in the channel drawer | Favorites-only filter uses accent-insensitive search and preserves original transport navigation order. |
| Done | Metadata polling efficiency | Implemented on 2026-10-18; hidden idle/offline polling is suspended and successful lyrics are cached. |
| P2 | Large-country catalogs | Measure scroll/render cost first; add pagination or windowing without removing SSR discovery links. |
| P2 | Catalog artwork resilience | Extend the fallback component to catalog/search cards and validate local image paths; personal and fullscreen artwork already has a fallback. |
| P2 | Performance measurements | Compare real LCP, INP, CLS, transferred bytes and request counts on mobile before choosing additional optimization. |
| Done | Favorites export/import | Versioned JSON, current-catalog preview, merge/deduplication and a 200-station limit; no account needed. |

Personal data currently stays in localStorage on the device. Cross-device sync, PWA offline playback and casting are separate features, not part of this change.

## Listening tools — issue #310

- Station detail and Now Playing share the canonical production station URL. Native share falls back to clipboard and then a selectable link; no share action requests playback.
- `/library` provides favorites JSON export/import. Import loads the shared static search index only when opened, previews current catalog metadata and missing/duplicate/overflow counts, and merges only after confirmation. Existing favorites, history and playback intent are preserved.
- Playback failures expose retry, alternate sources and a GitHub issue draft without exporting stream URLs or listening history. The draft requires the listener to review and submit it.
- Real-device Safari/iOS review and playback module extraction remain follow-up work.

## Playback health session diagnostics — partial delivery for #341

The recovery UI now distinguishes **connecting** (before first playback on
a source) from **buffering** (after the source was heard once). These are
transient states, not evidence of a permanently offline broadcaster.

Each recovery panel may show only *in-memory*, local-session evidence:
active source position and display label, bounded retry count, a categorized
browser error (network/decode/timeout/unknown), and the local time at which
that particular source last actually emitted a `playing` event. The
observed timestamp resets on every source/station switch; it is **not** a
globally verified station uptime check. Error messages must never claim to
distinguish CORS from a dead stream reliably.

The playback engine stays Native Audio + hls.js, with the existing
`MAX_STREAM_ATTEMPTS`, preserved source order, and no generic HLS proxy.
Stream URLs with credentials or tokens must not be written to the error
console or user reports. No new persistent storage, account tracking or
background health probes.

Automated regressions live in `tests/playback-diagnostics.test.mjs`.
The remaining #341 acceptance criteria include physical Safari/Chrome MP3,
AAC and HLS playback recovery verification; do not mark #341 completed until
those checks are recorded, alongside #340's iOS device matrix.

## Surprise Me — #344 (first functional delivery)

Homepage offers a **user-initiated** random-radio control. The index is fetched
only after clicking Random or opening optional filters, reusing the existing
cached lazy search loader. Public catalog metadata supplies country/category/
language facets when actually present; blank or unknown language/genre is
never guessed. The filter result count comes only from real catalog records.

Random selection is uniform within eligible canonical records and skips the
previously chosen random station whenever a second candidate exists.
After selection the app fetches the *current* country station catalog to
resolve the actual stream. Only an explicit click activates the existing
single `playback` store. It preserves station navigation, never autoplaying
on initial page load, and cancels pending selection if a route/playback action
happens during fetch. Missing, disabled or invalid stations fail gracefully.
The random control cannot guarantee that a remote stream is live; the usual
player fallback and recovery path remains responsible for playback errors.

Keep stream URLs out of the generated search index. Locale text and
facets are available in all seven UI languages. Tests:
`tests/surprise-radio.test.mjs`, `tests/station-search.test.mjs`.

Follow-up: assess faceted discovery metadata quality and catalog-wide
performance under #342 before adding more complex search/trending UI.

## Faceted Browse — #342 (initial implementation)

The homepage offers an explicit, collapsed **Browse stations** section after
Surprise Me. Expanding it is the only trigger for the existing cached static
search index download; merely mounting the homepage never fetches it.

- Combine a name/keyword search with exact catalog-sourced country, genre
  and language filters. Search is accent-insensitive. Unknown/missing genre
  and language values are left unknown, never inferred from station names.
- Facet menus reflect the other selected filters and the current query.
  Changing filters resets page 1. Reset clears all filters.
- Display six real canonical station links per page, never an unlimited list.
  Clamp stale page numbers and handle zero, one, a handful, or hundreds of
  results. Station click navigates to its existing detail route and does not
  autoplay; the global player remains mounted and untouched.
- Responsive layout at 320/375/390/430px and large desktops uses semantic
  `--radio-*` theme colors, visible focus, labeled controls, accessible
  empty/loading/retry states and translated labels in seven locales.
- Preserve all original home SEO title/description/schema, existing
  station canonical URLs and sitemap. Do not add new personal data tracking,
  fabricated station-health or country metadata. No live stream URLs are
  included in the public search index.

Regression tests: `tests/station-discovery.test.mjs`; reuse the generator
and cached loader already covered by `tests/station-search.test.mjs`.
Visual/browser validation and generated-site SEO checks remain release gates.
