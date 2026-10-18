# Vietnamese radio programme guides

## Scope

The station pages and the player **Schedule** panel offer a broadcaster-sourced
reference guide for three VOV Traffic services:

| Catalog station | Official broadcaster programme guide | Included |
| --- | --- | --- |
| `vov-giao-thong` (Hà Nội) | https://vovgiaothong.vn/lich-phat-song-hn/ | Reference programme blocks |
| `vov-gt-hcm` (TP.HCM) | https://vovgiaothong.vn/lich-phat-song-hcm/ | Reference programme blocks |
| `vov-mekong` (Mê Kông) | https://vovgiaothong.vn/lich-phat-song-mk/ | Reference programme blocks |
| `vov1` | https://vov1.vov.vn/ | Official link only (daily schedules vary) |
| `vov3` | https://vov3.vov.vn/lich-phat-song | Official link only (daily schedules vary) |
| `voh-fm-99.9-mhz` | https://voh.com.vn/radios/schedule | Official link only |
| `voh-fm-95.6-mhz` | https://voh.com.vn/radios/schedule | Official link only |
| `voh-fm-87.7-mhz` | https://voh.com.vn/radios/schedule | Official link only |
| `voh-am-610khz` | https://voh.com.vn/radios/schedule | Official link only |

The programmes are reference time blocks extracted from the broadcaster's
public guides in October 2026, not a live EPG and not a promise that each slot
will air every day. Provider schedules may contain omissions, overlapping
segments and occasional variations. **Do not extrapolate a missing interval**
or silently label the first schedule row as "Now playing." The public UI always
discloses the reference status and opens the official site in a safe new tab.

All listed times are **Asia/Ho_Chi_Minh (UTC+7)**, not the browser's local
timezone. The programme model computes Unix timestamps at Vietnam local midnight
so a listener elsewhere sees the correct broadcast day and clock labels.
The station page displays the reference guide even before playing; selecting
the station also exposes it in the existing Queue → Schedule tab.

The station registry is in `utils/vietnam-schedules.mjs`, independent of
the existing remote Zing and provincial schedule providers. Its lookups are
based on the canonical `/asia/viet-nam/<station>` route. The registry does
not make requests while SSR prerenders thousands of pages.

## Updating

- Verify exact programme names and time windows on each **official source**.
- Update the relevant station entry only; never copy a Hà Nội schedule to HCM
  or Mê Kông. Keep source links, timezone and reference disclaimer.
- Do not schedule recurring updates from unofficial scrapers. If a stable,
  permitted real-time EPG is available in the future, it may supersede these
  reference entries through the existing polling API, with source validation,
  caching, and a fallback when the broadcaster fails.
- Run `npm test`; the dedicated checks are in
  `tests/vietnam-schedules.test.mjs`.

## Gaps between listed programmes

Reference schedules can omit a period (for example VOV Giao thông TP.HCM
**16:15–16:30**). The player now renders a neutral **current-time marker**
inside the gap, with Vietnam's clock and the next listed programme/time.
The absence of EPG metadata must **not** be represented as the radio going
off-air, a confirmed broadcast title, or a technical stream failure.

The queue auto-centers the marker on opening Schedule, while preserving
manual scrolling until the user asks to jump back. At the next valid programme
boundary, the synthetic gap marker disappears and the real schedule row takes
over. See `referenceScheduleGap` in `utils/station-schedule.mjs` and the
regressions in `tests/station-schedule.test.mjs` and
`tests/browser/schedule-autoscroll.spec.mjs`.

## Vertical broadcast timeline

The reference-guide Queue now uses a real **hourly vertical EPG**, instead
of equally tall programme cards. Every hour on the left has an aligned grid
line, and each station programme occupies a duration-proportional column
block (76 CSS pixels per hour). The visible ruler continues past **midnight**
with the next Vietnam calendar date and early next-day hours.

A **green now line** crosses the grid at the correct clock position. Its
HH:mm:ss badge and position advance once per second using the
`Asia/Ho_Chi_Minh` clock, regardless of the user's local timezone. This is
a **schedule clock**, *not audio playback progress*; radio can be paused or
offline while the reference clock still indicates wall time.

At an unpublished interval such as the 16:15–16:30 VOV Giao thông HCM gap,
the grid remains visually empty of invented programme blocks and shows the
neutral message plus the next listed programme beside the current-time line.
No false "currently broadcasting" claim is made. At the 16:30 boundary, the
new real programme becomes highlighted automatically.

When the Queue/Schedule opens, the scrollbar centers the **now line** inside
the list. The listener can scroll to other periods without being pulled back;
a dedicated **Jump to current time** button restores the view. The existing
compact list remains in place for non-reference provider EPGs that lack
reliable programme start/end timestamps.

`referenceTimelineLayout` and `scheduleTimelineProgress` in
`utils/station-schedule.mjs` contain the timezone-aware geometry and
boundary maths. Regression coverage includes program length, next-day
ticks, a 16:29 gap and the 16:30 transition.
