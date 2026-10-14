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

## Google Analytics 4 (production only)

The existing `ga4.client.ts` dynamically initializes `gtag.js` for `radio.eplus.dev`
only. The player sends a custom `radio_listen_duration` event at about 30-second
intervals and on play interruptions or pauses (only if at least one second remains).
Staging and localhost do not emit this event.

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
