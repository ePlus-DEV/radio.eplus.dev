# ePlus OnAir — Client Performance Guardrails

Tracked by [Issue #328](https://github.com/ePlus-DEV/radio.eplus.dev/issues/328).

## What changed (2026-11-03)

1. The global online-presence clock now schedules **no timer at all** when the
   user is offline, the tab is hidden/unfocused, tracking is disabled, or the
   visitor is idle for five minutes. It persists the current foreground online
   time every 5 seconds when active, but provides a one-second live preview
   only while the user views `/library#stats`. Focus, interaction, route,
   privacy and page lifecycle events restart/stop the clock.
2. The global audio player starts its listening-duration interval **only after
   actual playback**. It stops on pause, buffer wait, errors, stream switch and
   explicit statistics reset/opt-out. Audio continues to accrue listening time
   in background tabs; page visibility is NOT a gate for actual playback.
   Checkpoints remain at 5 seconds outside the stats view.
3. Chart hover calculates `SVG.getBoundingClientRect()` once per pointer
   session (and again on new touch selection), not on every pointermove. It
   updates reactive hover state only if the selected day index changes.

## Maintain these invariants

- The two duration metrics are independent and intentionally overlap.
- A sleeping timer may not credit hours of missed foreground time. Preserve
  caps in `utils/online-duration.mjs`.
- Calling `clearStatistics()` must discard buffered time before restarting;
  disabling tracking must not persist a final unwanted checkpoint.
- Restore selection on page reload, never auto-start a stream.
- Preserve HLS.js start/recovery, native MP3/AAC, Media Session, locale and
  user favorites; don't remount the player on route navigation.
- No charting dependency or claim of speed improvement without measurements.

## Measurement before release

Use Chrome DevTools Performance + Network with mobile CPU throttling and the
same device/network profile for baseline and follow-up builds:

- Cold and warm landing page: LCP, CLS, transferred JS/JSON, and the
  `/search/stations.json` request. The full index must only fetch on intent.
- Open and close search in desktop header/mobile modal: time to results,
  keyboard navigation, fallback after failed Algolia.
- Scroll country cards: CPU time, ResizeObserver and resize callbacks,
  animation/paint and keyboard-hover behavior.
- Play, pause, resume, switch native and HLS stations: correct listening time,
  gap-free background playback, bounded retries and no hidden autoplay.
- Idle 5 minutes on Home and `/library#stats`: timer callbacks, localStorage
  writes, total online time, and battery/CPU traces.
- Hover/tap/keyboard date inspection at 7/30/90 days with both series active;
  compare INP and main-thread tasks.

After review, run `npm test`, `npm run generate:site`, Playwright smoke checks,
security analysis and staging Pages deployment. No direct changes to main.
