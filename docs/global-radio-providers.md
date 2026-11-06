# Global Radio — provider directory and Apple Music/TuneIn snapshot

## Purpose

The existing `public/radio/<area>/<country>.json` hierarchy contains HTML5/HLS
stations with internal playback. Apple Music live stations are a different kind
of entry: Apple/TuneIn control playback. Keep **Global Radio providers**
separate from the geographic catalog.

- Provider index: `public/catalog/providers/index.json`
- Provider records: `public/catalog/providers/apple-music.json`
- Public landing routes: `/global-radio`, `/global-radio/apple-music`,
  `/global-radio/apple-music/<station-id>`
- Route generation: `build/globalRadioRoutes.ts` (used by Nuxt prerender and
  production sitemap).
- UI: provider stations stay separate from geographic radio data, but are
  included as internal **discovery links** in Header/mobile search. Do not
  put stream URLs, signed HLS tokens or ephemeral access keys in the search
  index. Actual in-app playback still requires an approved/configured resolver.

## Public source snapshot — verified 2026-11-05

Source directory: https://tunein.com/radio/music/ and
https://tunein.com/radio/Stream-Apple-Music-Radio-Stations-c100035526/

| Local ID | TuneIn public listing | Apple Music destination | Notes |
| --- | --- | --- | --- |
| apple-music-1 | https://tunein.com/radio/Apple-Music-1-s345732/ | https://music.apple.com/us/station/apple-music-1/ra.978194965 | Core |
| apple-music-hits | https://tunein.com/radio/Apple-Music-Hits-s345724/ | https://music.apple.com/us/station/apple-music-hits/ra.1498155548 | Core |
| apple-music-country | https://tunein.com/radio/Apple-Music-Country-s345725/ | https://music.apple.com/us/station/apple-music-country/ra.1498157166 | Core |
| apple-music-club | https://tunein.com/radio/Apple-Music-Club-s345726/ | https://music.apple.com/us/station/apple-music-club/ra.1740613859 | Core |
| apple-musica-uno | https://tunein.com/radio/Apple-M%C3%BAsica-Uno-s345727/ | https://music.apple.com/us/station/apple-m%C3%BAsica-uno/ra.1740613864 | Core |
| apple-music-chill | https://tunein.com/radio/Apple-Music-Chill-s345733/ | https://music.apple.com/us/station/apple-music-chill/ra.1740614260 | Core |
| apple-music-holiday-hits | https://tunein.com/radio/Apple-Music-Holiday-Hits-s363737/ | https://music.apple.com/us/station/holiday-hits/ra.6825447412 | Seasonal; may be unavailable outside holidays |

The six core channels come from TuneIn's `Apple Music Radio Stations`
collection. Apple Music Holiday Hits appears as an additional **seasonal**
listing in TuneIn's public music category. It must not be confused with
`Apple Music Hits` or assumed available year-round.

Channel artwork uses public TuneIn CDN cover URLs and separate ePlus-made SVG
fallback artwork for each of the seven stations under `public/img/global-radio/`.
Fallback illustrations do not purport to be official Apple logos.

This is a **manual, conservative import of publicly visible station metadata**
(names, basic genres, public page URLs); it does **not** scrape music, copy
playlists, download brand images, bypass TuneIn access controls, extract signed
stream manifests, or reproduce copyrighted programming. No TuneIn private API
or browser-authenticated content is used. Each record retains its source URL
so a human can re-check it later. `metadata_checked_on` is a catalog-review
date, **not** an uptime check.

## Playback and privacy

- External links open the corresponding provider's site in a new tab/window.
- A TuneIn page and an Apple Music station webpage are **not** MP3/HLS streams.
  Never hand them to `stores/playback.ts` or `PlayerSession`.
- Access restrictions, region locks, sign-in and Holiday availability are
  controlled by Apple/TuneIn, not ePlus OnAir.
- No playback telemetry or local listening duration is fabricated for these
  external stations; ePlus OnAir cannot measure external listening time.
- Original region/country stations and URLs remain unchanged.

## Signed HLS limitations and public listening experience

ePlus OnAir cannot offer a permanent one-click internal Apple Music stream
from time-limited `itsliveradio.apple.com` TuneIn URLs. Those URLs contain
signed `accessKey` query tokens that expire and may be restricted by CORS,
service terms, account authorization, or location.

The **public** Global Radio pages are designed for nontechnical listeners:
- Seven responsive cards show real station metadata and channel artwork. An
  in-app Play/Pause action uses a configured resolver only when available;
  external listening links remain accessible on each detail page.
- Search results link to the matching provider station detail page and do not
  auto-play; external provider destinations are distinct from in-app controls.
- **No URL/token input, HLS preview modal, or signed key** is exposed on
  public provider pages. A discoverable result is not a playback guarantee.
- The Apple/TuneIn provider pages and metadata remain separate from normal
  ePlus country-based playable radio stations, history, favorites, player
  statistics and station SEO. No copyrighted audio is rehosted.

The prototype source `components/global-radio/TemporaryHlsPreview.vue` and
its validation utility are retained for controlled developer compatibility
research only; they are not mounted on public routes. Do not promote a
temporary signed URL or browser-based key scraping as a stable stream source.

For authorized future first-party in-app playback, see
[#358](https://github.com/ePlus-DEV/radio.eplus.dev/issues/358). MusicKit
requires its own verified developer-token/user-login integration and a
compatibility and provider-rights review before production deployment.

## Future providers

Add `public/catalog/providers/<slug>.json`, register it in the index,
and implement a provider-specific static page or generalize the pages in a
separate, reviewed PR. Do not create a fake "Global" country in world.json.
Always verify source/provenance, link targets and whether direct playback
has a documented authorization mechanism. Model all external-only cards
separately from internally playable stations.

## QA / deployment

- `npm test`: `tests/global-radio-provider.test.mjs` verifies schema,
  station deduplication, public URLs, translations and route separation.
- `npm run generate:site`: verify 9 new prerendered paths (landing, provider,
  seven station detail pages) and sitemap entries. Ensure staging stays noindex
  and has no sitemap, production canonical host remains radio.eplus.dev.
- Browser QA: 320/375/390/430px and desktop light/dark, keyboard focus,
  external link rel/target, link availability, and no activation of audio
  playback via the provider directory.
- New features target `staging` and require a separate release PR to `main`.

## Shared Header/mobile search (2026-11-06)

`scripts/build-station-search-index.mjs` combines public country station metadata
with all seven Global Radio provider station **detail routes** from the separate
`public/catalog/providers` directory. It does not add Global Radio to geographic
`world.json`, and does not expose stream, TuneIn lookup or signed HLS URLs.
Search results show their cover art (with station-specific SVG fallback) and
navigate to `/global-radio/apple-music/<station-id>` without autoplay.

Algolia may still index only geographic stations. Search in the Header/mobile
UI therefore merges the matching local Global Radio results with remote Algolia
results, deduplicated by URL. The local index stays lazy-loaded on search focus,
while GitHub Actions search-cache input hashes now include provider JSON files.
