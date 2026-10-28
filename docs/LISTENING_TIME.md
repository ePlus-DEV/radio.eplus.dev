# Listening time — personal dashboard and GA4 reporting

## How it works

Open **Library → Listening time** at `/library#stats`. Time accumulates only when the native
audio element reports actual playback (`playing`); it stops during pause, buffering,
stalled media, ended streams, source changes, errors, and page exit.

The player checks in every five seconds and persists time as whole milliseconds in
`localStorage.radio_listening_duration_v1`. The clock uses monotonic
`performance.now()` and preserves background-radio listening when timers are throttled,
with a six-hour safety cap on any one missing checkpoint.

The dashboard shows total lifetime time, time **today in the listener's local timezone**,
and the breakdown by station. It also has an interactive **daily listening-time bar
chart** at `/library#stats` with selectable **7 / 30 / 90 days**: click or
keyboard-activate a bar to inspect the exact daily duration. The chart uses the
same live preview as the player and updates without a page reload.

The `byDay` dictionary is kept alongside `totalMs`, `todayMs`, and
`byStation` in `radio_listening_duration_v1`. Each five-second checkpoint is
split at **local midnight**, including timezone/DST boundaries. Per-day
history keeps the most recent 365 recorded calendar days; lifetime totals
are preserved even as old chart buckets are pruned. Up to 100 station totals
are retained. Existing v1 statistics migrate the *one known today bucket*
without erasing historical totals; previous calendar days were not recorded
and **cannot be reconstructed**.

No listening time before initial tracking can be reconstructed. Private/incognito
or cleared browser storage starts fresh. No cross-device synchronization or account
is required.

**Recently played is a separate list:** clearing its entries requires a Yes/No confirmation
and does not clear favorites, last selected station, or the listening time statistics.

## User privacy controls

In **Library → Listening time**, listeners can:

- Switch **Track listening time** off or on without interrupting the radio. The
  setting is saved in `radio_listening_tracking_enabled_v1` (`0` means off;
  missing or `1` means on). Opting out immediately discards any unflushed
  interval, hides the live-counting badge, and prevents future
  `radio_listen_duration` GA4 events, including pause/stop reports. Previously
  saved personal statistics stay visible, and Recently played continues to
  work separately.
- Select **Delete listening statistics** to open a Yes/No confirmation modal.
  Confirming removes `radio_listening_duration_v1` (lifetime totals, per-day
  history and per-station time), resets all visible charts and discards any
  active buffered duration. The tracking preference, favorites, Recently
  played and playback preferences are not deleted. If tracking remains enabled
  and the radio is playing, a new counting session starts from zero.

The privacy setting and deletion are synchronized between same-origin browser
tabs through `storage` events. Clearing statistics does **not** delete events
already received by Google Analytics; users should be told that this controls
future radio listening-duration analytics, not all GA4 pageview analytics.

## Google Analytics 4 (production only)

Production's prerendered HTML includes one Google tag bootstrap in `<head>`
(via `utils/ga4-config.mjs` and `nuxt.config.ts`). The script verifies the browser
hostname is exactly `radio.eplus.dev` before loading official `gtag.js` and
initializing measurement ID `G-ETDY41KBBJ`. This sends the first `page_view`
even if Nuxt hydration fails. GA4 Enhanced Measurement handles subsequent
browser-history page changes; keep its **Page changes based on browser history
events** option enabled in the GA4 Web stream. Do not load a second tag or
reintroduce a manual Nuxt page-view sender, which could double count.

The player uses the same global `window.gtag` to send a custom
`radio_listen_duration` event at about 30-second intervals and on play
interruptions or pauses (only if at least one second remains). Staging,
previews on other hostnames, and localhost do not send this event.

| Event parameter | Type | Usage |
| --- | --- | --- |
| `station_path` | String | Station URL path, e.g. `/europe/united-kingdom/heart-uk` |
| `station_name` | String | Human-readable station name |
| `listen_seconds` | Number | New actual listening seconds **since the previous event** |

The number of events is **not** the number of listeners or number of seconds.
Sum `listen_seconds` to estimate the total GA4-measured listening duration.

**One-time setup in the GA4 property (ID `G-ETDY41KBBJ`):**

1. In **Admin → Custom definitions**, create an event-scoped custom dimension with
   event parameter `station_path`; optionally create one for `station_name`.
2. Create a custom metric named **Radio Listening Seconds** based on event parameter
   `listen_seconds`, with unit **Standard** (seconds are provided as the numeric value).
3. In **Explore**, filter to `event_name = radio_listen_duration`, group by station
   path/name, and sum the custom metric.
4. Test on production with Tag Assistant, GA4 Realtime/DebugView, or Network requests
   to `google-analytics.com/g/collect`; allow GA4 processing time for custom metrics.

Event delivery is subject to browser privacy settings, network/ad blockers, and the
underlying GA4 implementation, so global reporting is an estimate rather than a
guaranteed accounting ledger. Event payloads include the station route and name
but not personal listening history or favorites.

For full implementation details see `utils/listening-duration.mjs`,
`stores/listeningDuration.ts`, and `components/player/Player.vue`.

## Regression checks

```bash
npm test
npx playwright test tests/browser/listening-history.spec.mjs
```

The Playwright suite requires a running local Nuxt build and browsers installed.
The repository's normal workflow runs unit tests by default; browser tests are opt-in.
