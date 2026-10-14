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
