# Playback device QA matrix — #340 / #341

> **Status: NOT EXECUTED ON PHYSICAL DEVICES.** This is a reproducible test
> protocol, not a claim that browser/device behavior has passed. Record
> findings in [#340](https://github.com/ePlus-DEV/radio.eplus.dev/issues/340)
> with evidence before checking off any real-device requirements.

## Scope, provenance and prerequisites

- App: `ePlus OnAir` / `radio.eplus.dev`; prefer the latest **develop**
  preview first and always record its commit SHA. Production may be behind
  `develop`; do not conflate the two.
- Browsers: iPhone Safari, **Add to Home Screen** (iOS standalone), Android
  Chrome, desktop Safari, desktop Chrome. Include iOS version, model,
  connectivity (Wi-Fi/mobile), time zone and installed/regular browser mode.
- Two audio paths must be tested independently: native HTML5 audio and HLS.
  Browser Media Session controls may not be available in every environment.
- Never publish live audio URLs, temporary signed keys, cookies, tokens,
  phone numbers or IP addresses in the evidence. Link canonical public
  station pages only.
- **Sample public station pages from the catalog as of 2026-11-05**:
  - MP3 candidate: [Studio Brussel](https://radio.eplus.dev/europe/belgium/studio-brussel)
  - AAC candidate: [MNM](https://radio.eplus.dev/europe/belgium/mnm)
  - HLS candidate: [VOV 1](https://radio.eplus.dev/asia/viet-nam/vov1)
  These are **catalog-indicated formats**, not verified working streams.
  If a URL is changed or unavailable at test time, record it and pick a
  documented equivalent using the actual station catalog. Do not silently
  replace an unavailable source.

## Required evidence fields

For each executed test, record:

| Field | Value |
| --- | --- |
| Date/time and app commit | _pending_ |
| Device model and OS version | _pending_ |
| Browser name/version or A2HS mode | _pending_ |
| Network type and station canonical path | _pending_ |
| Catalog format and actual playback format | _pending_ |
| Auto Reconnect / Resume Live preferences | _pending_ |
| Test case ID and exact action sequence | _pending_ |
| Expected vs actual, PASS/FAIL/BLOCKED | _pending_ |
| Elapsed time, visible UI states, media controls | _pending_ |
| Sanitized logs/screenshots or screen recording | _pending_ |

Use `PASS` only when the *expected audible behavior* is observed on that
device. A passing unit test, automated Chromium test or successful HTTP
manifest fetch is **not** proof of audible Safari playback.

## Real-device execution matrix

Run each applicable case for MP3, AAC and HLS; record any unsupported
combinations as `N/A`, not `PASS`.

| ID | Steps | Expected result | Status |
| --- | --- | --- | --- |
| QA-01 | Open station route in a fresh tab with a previously saved station; reload | No audio/autoplay until a deliberate Play gesture | NOT RUN |
| QA-02 | Tap Play and listen for >30s; open another site route | One active station/audio session; no duplicate playback, player stays mounted | NOT RUN |
| QA-03 | Pause for >10s, then Play with **Resume Live ON** | Playback returns to current live content (not an old buffer); station identity remains | NOT RUN |
| QA-04 | Pause with **Resume Live OFF**, then Play | Follow documented user preference without unexpected station changes | NOT RUN |
| QA-05 | Lock iPhone/Android, leave stream running; use lock-screen Play/Pause | Actual sound and controls reflect play/pause; no unexpected autoplay | NOT RUN |
| QA-06 | Bluetooth/headphone Play/Pause and Next/Previous while another route is open | Commands operate on current live station and existing queue once only | NOT RUN |
| QA-07 | Incoming call or audio interruption; resume manually if needed | No duplicate audio, stale UI, unsolicited playback or lost station | NOT RUN |
| QA-08 | Switch Wi-Fi to mobile network or temporarily go offline during playback | Offline state shown; recovery only if allowed, same station, bounded retries | NOT RUN |
| QA-09 | Disable Auto Reconnect; induce an unreachable or stalled stream safely | No infinite spinner; manual Retry offered; no fallback without consent | NOT RUN |
| QA-10 | Enable Auto Reconnect; use one unreachable stream source | Up to six attempts in one episode, then a stable error/Retry state | NOT RUN |
| QA-11 | Use station with multiple sources and one failing source | Fallback retains station identity and uses defined candidate ordering | NOT RUN |
| QA-12 | Induce stalled **HLS** or unavailable playlist; retry | HLS failure does not hang forever or expose signed URL in logs | NOT RUN |
| QA-13 | Play, wait, pause, navigate, reload, and inspect site audio element count | Exactly one global audio player; no extra hidden playing elements | NOT RUN |
| QA-14 | Leave the app in background for >5 minutes, then return | UI and audio correctly reflect actual state; timers do not resurrect paused playback | NOT RUN |
| QA-15 | Switch dark/light and 320/375/390/430px widths while error UI is open | Retry/source chooser and error text remain visible, keyboard/touch accessible | NOT RUN |

**Important limitations:** `navigator.onLine` cannot distinguish a broadcaster
being down from CORS, DNS, mobile carrier restrictions or unstable Wi-Fi.
HLS failures may differ between Safari native HLS and Chromium hls.js.
A "last played" timestamp is a local-session observation, not a station
uptime verification.

## Automated coverage (supplement only)

- `npm test`: `tests/playback-recovery-policy.test.mjs`,
  `tests/player-buffering-state.test.mjs`, `tests/radio-source-plan.test.mjs`
  and existing no-autoplay/live-resume checks.
- `npm run generate:site`, then `npm run test:ui`: Chromium browser
  regression against generated static pages (not against a device).
- `tests/browser/playback-lifecycle-qa.spec.mjs`: reload stays silent,
  route transitions preserve the one audio element, explicit Play works.
- GitHub CI's browser tests are intentionally **opt-in** via
  `ENABLE_BROWSER_TESTS`. Do not enable them globally without owner
  approval; record whether the step was actually executed.
- No virtual browser test substitutes for a physical iPhone Safari or
  Android headset interruption/background test.

## Sign-off and defect handling

1. Record all executed cases and paste a compact results table into #340.
2. If a case fails, create a focused linked bug issue with device, station
   canonical route and reproducible steps; avoid publishing private data.
3. Review #341 only when MP3/AAC/HLS fallback and retry cases are documented.
4. Do not close #340 or #341, or claim production QA passed, on the strength
   of code merge or synthetic browser tests alone.
