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
- UI: these are **external destinations**, not internal stations. Do not
  populate `stream`, `streams`, queue, listening history, or fake play buttons.

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

## Experimental HLS preview (user-supplied URL, **not** production integration)

The Apple Music provider detail pages expose an opt-in, client-only
**HLS preview** for a short-lived URL that the visitor has obtained
legitimately and is authorized to use. This is for compatibility checks and
cannot be treated as a stable source of Apple Music audio.

- Uses `components/global-radio/TemporaryHlsPreview.vue` and
  `utils/apple-hls-preview.mjs`, not the normal catalog/player.
- Accepts only HTTPS `itsliveradio.apple.com/3p-tune-in/tune_in/<id>/...`
  with a single signed `accessKey`; local validation binds the station
  numeric ID to its official Apple Music station detail link.
- A timestamp prefix is inferred from observed examples, **not an official
  contract**. Preview rejects URLs that appear expired or about to expire,
  and stops at the inferred deadline. The token is never committed,
  requested from a server, refreshed, sent to analytics, persisted to
  localStorage/history, added to the internal stream search index, or
  represented in shareable URLs. Browser DevTools may still show the actual
  Apple network requests needed to play audio.
- HLS loads through an opt-in browser-side test: native HLS on iOS,
  otherwise hls.js/MSE when supported. Playback pauses the main ePlus OnAir
  player, and the preview stops if the user resumes the main player or
  navigates away. It never counts toward listening history or statistics.
- Cannot guarantee CORS, permission to rehost, regional availability,
  or Apple/TuneIn authorization; an Apple/TuneIn page remains the supported
  fallback. **Do not** build a signed URL generator, scrape authenticated
  provider sessions or proxy HLS manifests to bypass cross-origin controls.
- The coding environment cannot reliably reach the Apple HLS hostname;
  live HTTP/CORS or audible playback must be tested manually on actual
  devices with a valid authorized URL. Source-level tests do **not**
  establish that it will play from `radio.eplus.dev`.

**Production integration alternative:** Apple documents MusicKit on the
Web as its supported API for radio playback. That needs an Apple Developer
setup and valid developer token, authenticated Apple Account access and a
separate rights/UX review. Keep the experimental preview clearly labeled
until that authorized flow is available.

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
- New features target `develop` and require a separate release PR to `main`.
