# Custom radio streams: phased MVP and safety gates (#350)

This first PR is a **data-model-only foundation**, not a user-facing custom-stream player. It does not publish a form, call a remote API, or cause playback.

## Planned user flow

1. A user explicitly selects Add custom stream in Library, enters a title and a public radio URL.
2. Validate locally with no network probe. Present the guessed transport/format as **unverified**. Explain CORS, unsupported browser codecs and possible HTTP mixed-content failures.
3. Add to a dedicated browser-local collection, capped at 40 entries. Support editing, import/export, cross-tab sync and deletion with a confirmation prompt.
4. Only an explicit Play click selects the record in the existing **single** global audio session. Never autoplay after reload or navigate to a synthetic public station URL.
5. Keep private records out of public catalog JSON, SEO pages, canonical URLs, sitemap, search index, analytics, GitHub issue reports and logs.

## URL policy

- Accept absolute HTTP(S) URLs using public-looking DNS names, with no embedded username/password, fragment or recognizable credential-bearing query parameter.
- Refuse IP literals (even globally routed IPs), single-label hosts and detectable local/private suffixes, as well as obvious non-audio file extensions.
- This validation **cannot prove** a URL is actually public or safe after DNS resolution/redirects. Do not proxy/fetch arbitrary user URLs from any application backend. The user's browser is responsible for stream fetches.
- A stream extension is only a *hint*, not measured codec, bitrate or online state. Unknown-format Icecast/Shoutcast endpoints are allowed with an explicit unverified warning.
- HTTP URLs on an HTTPS app may be blocked by browser mixed-content policies; no automatic HTTP upgrade, proxy or CORS workaround.

## Phase gates

- [x] Pure URL validator, bounded local collection, stable versioned import/export model, create/edit/delete helpers and safety tests
- [ ] Client-only persistence integration using a separate localStorage key; do not migrate/mutate favorites or listening history
- [ ] Accessible Library add/edit/delete/import/export UI, explicit delete confirmation, all seven locales and mobile themes
- [ ] Playback integration with the existing single player and bounded recovery; never proxy custom streams
- [ ] Browser QA on Safari/iOS, Android and desktop for MP3/AAC/HLS, CORS/mixed content, reload and network recovery
- [ ] Full CI, PR Preview, SEO/noindex/GA4 and Pages footprint checks on staging, separate reviewed production release

This document does not claim any real custom stream has been verified or playable. Supabase, account sync and native app implementation are out of scope.
