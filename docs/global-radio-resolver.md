# Authorized Apple Music radio resolver — ePlus OnAir

Issue: [#358](https://github.com/ePlus-DEV/radio.eplus.dev/issues/358).

## Public TuneIn playback — configured CORS proxy

The 2026-11-05 GitHub Actions technical probe confirmed, for **all seven** catalog
stations, that a public `opml.radiotime.com/Tune.ashx` request with only
`id`, `render=json`, `formats=aac,hls,mp3` returns a fresh signed Apple
HLS master playlist. The owner's existing
`https://cors-eplus-bba6d8ad0ca6.herokuapp.com/` CORS proxy returns
HTTP 200 and allows the staging Origin; the Apple Holiday Hits master
`/3p-tune-in/tune_in/ppa-ts/index-ts.m3u8` returned HTTP 200 and `#EXTM3U`.
This technical observation is not a browser audio test or a statement about
redistribution permissions.

The browser uses the HTTPS proxy from `NUXT_PUBLIC_CORS_SERVER_1` (`config.public.corsServer`) and a strict 7-station ID allowlist. If the env is missing or invalid, there is no hardcoded fallback to Heroku and this direct lookup is disabled.
A Play click calls only the official public TuneIn lookup for that station;
a returned URL must be HTTPS, on the exact Apple live-radio host, with a
station-matched observed HLS path and a fresh signed `accessKey`. It is then
passed to the existing shared HLS player. The existing app-level renewal
timer repeats the lookup before expiration, without user-supplied URLs,
PAL impersonation, HAR replay, persistent tokens or a second audio element.

This mode requires **no new Heroku backend code**. To use it with static GitHub Pages, configure `NUXT_PUBLIC_CORS_SERVER_1` under the `staging`/`production` GitHub Environment Variables (legacy `development` Staging configuration only until the migration flag is enabled). The deploy workflow must forward that value at build time. The existing optional
`NUXT_PUBLIC_GLOBAL_RADIO_RESOLVER_URL` remains a fallback for other approved
resolvers. The Heroku proxy availability, browser/Apple CORS, region and
provider behavior can change; a failed lookup shows the normal error and
Apple/TuneIn external links remain available.

Technical evidence (sanitized; no access keys): GitHub Action
`hoangsvit/heroku-cors` run
https://github.com/hoangsvit/heroku-cors/actions/runs/42027254699
and source probe
https://github.com/hoangsvit/heroku-cors/actions/runs/42026930807.

## What is implemented

- With the CORS env configured: an anonymous, public TuneIn lookup for one of seven fixed station IDs, relayed through the configured HTTPS CORS origin.
- The returned Apple HLS URL is validated against the selected station,
  expected MPEG-TS/CMAF path, signed key and token expiry; it is played in the
  existing global PlayerSession (hls.js/native HLS).
- Client-side renewal repeats the public lookup before token expiry, without
  storing tokens or touching the country radio catalog.
- Apple Music and TuneIn official links remain as fallbacks. No SEO changes.
- An explicitly configured approved private resolver is still supported as
  fallback, but is **not required** for the public direct mode.

**Current status:** All seven direct TuneIn public resolutions and the
existing Heroku CORS transport have passed live technical probes. The
Holiday Hits master playlist loaded with HTTP 200 and valid HLS syntax.
Actual click-to-audio playback on the deployed ePlus staging site, on both
Chrome and Safari, remains to be verified before release.

## Optional private backend resolver API contract (fallback only)

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
The client requires a known Apple Music station ID, an exact Apple HLS host
and an `accessKey`; the earlier of server expiry or the embedded key epoch
must be at least 45s away. Signed HLS paths are allowlisted as either
`/3p-tune-in/tune_in/<Apple radio ID>/<region>/<bitrate>.m3u8`, or, only for
Apple Music Holiday Hits (Apple ID `6825447412`), the following paths:
- `/3p-tune-in/tune_in/ppa/index-cmaf.m3u8` — master playlist. Prefer this
  provider-issued URL as the playback entrypoint where permitted: it contains
  signed child URLs for 64/256 kbps and a backup host.
- `/3p-tune-in/tune_in/ppa/usw/256.m3u8` and `.../usw/64.m3u8` — directly
  playable media playlists, confirmed HTTP 200 by the user's private HAR.

The master, media playlists, initialization map and `.m4s` segments carry
**different accessKey values**. Never synthesize child URLs by copying the
master token. The observed signed URLs prove a streaming sequence occurred in
TuneIn; they do not reveal the secret key issuer, authorization requirements,
or how to generate fresh tokens independently. The approved backend must
verify the selected station before issuing an entrypoint URL. No real
accessKeys or HAR session identifiers belong in this repository.

For a normal pending/unauthorized/unavailable provider, respond with a
non-2xx status and a generic JSON message. The app then keeps official links.

## Optional private backend setup (not required for direct playback)

**The website is prerendered/static on GitHub Pages.** A variable only in
`.env.example`, or in a GitHub Environment that the workflow does not pass
through, has **no effect** on the published site.

1. Implement and independently test the approved ePlus-owned endpoint. The
   existing Heroku root URL alone is not a verified resolver route.
2. In **GitHub → ePlus-DEV/radio.eplus.dev → Settings → Environments →
   staging → Variables**, set
   `NUXT_PUBLIC_GLOBAL_RADIO_RESOLVER_URL` to the full HTTPS API route.
   Use production environment separately only when approved for production.
3. The `deploy-github-pages.yml` workflow explicitly passes
   `vars.NUXT_PUBLIC_GLOBAL_RADIO_RESOLVER_URL` into Nuxt at build time.
   Deploy `develop` again (via a trusted push or manual workflow dispatch).
4. The public TuneIn Play path uses `NUXT_PUBLIC_CORS_SERVER_1`, independent of this optional resolver environment variable;
   the configured backend is only tried if the public lookup fails. Check the
   generated HTML for correct configuration without exposing signed URLs.
5. Validate playback on real devices. Keep the variable unset until the
   backend responds correctly with a licensed, fresh stream.

## Requirements when enabling the optional private backend

1. **Authorization:** Use only a provider-approved integration. `Tune.ashx`
   observed in a user HAR returning a signed stream does *not* grant ePlus
   permission to reuse the API, impersonate TuneIn, harvest credentials or
   redistribute HLS. This code does none of those actions.
2. **CORS:** Allow only intended origins (`https://radio.eplus.dev`,
   `https://staging.radio.eplus.dev`, optionally `https://new-radio.eplus.dev` during migration, and localhost explicitly for local testing).
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
6. **Release:** The optional backend can be enabled separately. The public
   direct path requires no new backend route or environment variable. Test
   staging playback, CORS, region handling and expiry in Safari/Chrome before
   promoting any change to `main`.

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

## CORS proxy environment configuration (2026-11-06)

- The browser gets the CORS proxy base from `config.public.corsServer`, backed by `NUXT_PUBLIC_CORS_SERVER_1` in local `.env`. No proxy hostname is embedded in the Apple TuneIn source code.
- For GitHub Pages configure `NUXT_PUBLIC_CORS_SERVER_1` in GitHub → Settings → Environments → **staging** (Staging), and **production** (Production) if approved for release; the deploy workflow passes the variable into the Nuxt static build. Redeploy after changes. When switching from `new-radio.eplus.dev` to `staging.radio.eplus.dev`, update the **external CORS proxy and resolver Origin allowlists** before enabling the new host; site code cannot change remote service policy.
- Provide a full HTTPS origin, optional trailing slash, no path/query/fragment/credentials. Without a valid configuration, public TuneIn lookup is disabled, with no implicit Heroku fallback. Optional approved `NUXT_PUBLIC_GLOBAL_RADIO_RESOLVER_URL` remains separate.
- Existing GitHub Actions probes used a particular Heroku proxy; they are historical technical evidence and not a guarantee that the newly configured domain, in-browser audio, or provider rights are verified.
