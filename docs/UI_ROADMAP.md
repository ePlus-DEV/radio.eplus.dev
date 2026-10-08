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

## Follow-up priorities

| Priority | Improvement | Acceptance criteria |
| --- | --- | --- |
| P1 | Dedicated mobile Now Playing view | Large artwork/title, transport, favorite, sleep timer and source tools remain usable in portrait/landscape and with long or RTL station names. |
| P1 | Stream health reporting | Distinguish offline network, unsupported source and exhausted retries; provide a clear retry action without treating temporary buffering as failure. |
| P1 | Real-device Safari/iOS review | Check background playback, headset/lock-screen actions, keyboard viewport, safe areas and reload silence on an iPhone. |
| P1 | Playback module extraction | Separate audio lifecycle, retry recovery, Media Session and UI from the large player component while preserving route persistence. |
| P2 | Persist user volume/mute | Restore supported volume controls safely without autoplay; iOS retains its system-volume guidance. |
| P2 | Favorites in the channel drawer | Add a favorites-only filter and consistent accent-insensitive filtering while keeping the original country order for Previous/Next. |
| P2 | Metadata polling efficiency | Suspend unnecessary work when hidden and paused/offline, retain lock-screen metadata during playback, and avoid refetching unchanged lyrics. |
| P2 | Large-country catalogs | Measure scroll/render cost first; add pagination or windowing without removing SSR discovery links. |
| P2 | Artwork resilience | Validate local image paths, show a stable fallback on failed loads, and reserve image space to prevent layout shifts. |
| P2 | Performance measurements | Compare real LCP, INP, CLS, transferred bytes and request counts on mobile before choosing additional optimization. |
| P3 | Favorites export/import | Validate a versioned JSON format and let users move their lists without an account. |

Personal data currently stays in localStorage on the device. Cross-device sync, PWA offline playback and casting are separate features, not part of this change.
