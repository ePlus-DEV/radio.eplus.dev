# Authorized Apple Music radio resolver — ePlus OnAir

Issue: [#358](https://github.com/ePlus-DEV/radio.eplus.dev/issues/358).

## What is implemented

- The static Nuxt app can ask a separately operated **ePlus-owned authorized API**
  to resolve a selected Apple Music Radio station to a *short-lived* HTTPS HLS URL.
- This does **not** require Cloudflare Workers. The existing Heroku app is a
  suitable host **once its source is reviewed and the route is implemented**.
- The shared Nuxt PlayerSession (hls.js/native HLS) plays the returned source.
  No second audio element, manual URL input, or token persisted in catalogs/storage.
- A single app-level client timer renews an authorized HLS URL 40s before the
  earlier of the backend-reported expiry or timestamp found in the signed URL.
  Failure stops playback and clears the expired stream.
- When not configured, no in-app Play button appears. Apple Music/TuneIn
  external links continue working. Existing station SEO stays unchanged.

**Current status:** This PR implements the ePlus frontend/contract only. It has
not added an endpoint to the owner's live Heroku server, acquired any playback
rights or tested an authorized Apple/TuneIn stream in production. Do not claim
the one-click stream is live until all three are confirmed.

## API contract for the existing ePlus Heroku server

Configure `NUXT_PUBLIC_GLOBAL_RADIO_RESOLVER_URL` as the *full HTTPS path* to
an ePlus-owned, approved resolver, for example
`https://cors-eplus-bba6d8ad0ca6.herokuapp.com/api/radio/resolve`.
**This is an example path only — it is not known to exist.**

Browser performs (without cookies, storage, authorization header or TuneIn credentials):

```http
GET /api/radio/resolve?provider=apple-music&station_id=apple-music-1
Accept: application/json
```

On approved, valid station resolution the backend MUST return:

```json
{
  "status": "ok",
  "authorized": true,
  "provider": "apple-music",
  "station_id": "apple-music-1",
  "stream_url": "https://itsliveradio.apple.com/3p-tune-in/tune_in/978194965/usw/256.m3u8?accessKey=<redacted>",
  "expires_at": 1793900000
}
```

`expires_at` must be a real Unix timestamp in **seconds**, strictly later
than now. The example expires value is illustrative, not a working URL.
The client requires a known Apple Music station ID and checks the corresponding
`ra.<id>` matches the HLS path, the Apple HLS host is exact, an `accessKey`
exists, and the earlier of server expiry or embedded key epoch is >= 45s away.

For a normal pending/unauthorized/unavailable provider, respond with a
non-2xx status and a generic JSON message. The app then keeps official links.

## Backend requirements before enabling the feature

1. **Authorization:** Use only a provider-approved integration. `Tune.ashx`
   observed in a user HAR returning a signed stream does *not* grant ePlus
   permission to reuse the API, impersonate TuneIn, harvest credentials or
   redistribute HLS. This code does none of those actions.
2. **CORS:** Allow only intended origins (`https://radio.eplus.dev`,
   `https://new-radio.eplus.dev`, localhost explicitly for development).
   Do not expose a public arbitrary-URL proxy; require provider and station IDs
   from an allowlist. Reject forged host, private networks, redirects and SSRF.
3. **Privacy:** Never log, cache in CDN, analytics, error monitoring, or persist
   `stream_url`, `accessKey`, provider credentials or user auth tokens. Set
   `Cache-Control: no-store`; do not send credentials to the browser.
4. **Reliability:** Rate-limit per caller and station; enforce response timeout;
   validate origin/station and expiry upstream; return helpful HTTP status
   codes without disclosing confidential URLs. Provider expiry may be shorter
   than the `nowPlaying.Ttl` metadata field.
5. **HLS:** Prefer direct browser fetch from Apple **if permitted and supported**
   instead of proxying large `.ts`/`.m4s` segments through Heroku; signed
   manifests and child resources may have independent access restrictions.
6. **Release:** Create backend route first and validate with genuine permitted
   credentials; then set the public endpoint env var in the GitHub Actions
   build environments and rebuild the static `develop` preview. Only after
   Safari/Chrome/region/expiry tests should the release be promoted to `main`.

## Manual acceptance checks

- With the env var empty: no in-app Play button; provider links still work.
- With a configured authorized backend: card/detail Play resolves a source
  and activates **the global player**, showing correct station metadata.
- Changing from regular country radio to Apple HLS and back stops prior audio;
  only one audio element remains.
- Refresh before token expiry happens once and does not create repeated
  fetches from multiple card components; errors cannot restart stale HLS.
- On failed resolver response or unapproved/expired URL, show fallback and
  avoid storing the response in user history or telemetry.
- Country-based station SEO, sitemap, dark/light mode and mobile layout stay intact.

## Known limitations

The URL in the HAR was observed only in the context of TuneIn's own website.
CORS headers on that request allow TuneIn's origin, not ePlus. A generic CORS
proxy does not decode or create a signed Apple `accessKey`, and does not confer
legal rights. MusicKit is a separate official path that requires legitimate
Apple Developer credentials and further compatibility tests.
