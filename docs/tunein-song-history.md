# TuneIn song history for Apple Music Radio

Implemented on top of [PR #372](https://github.com/ePlus-DEV/radio.eplus.dev/pull/372).

## Scope

- Only the seven allowlisted Apple Music Radio stations use the anonymous,
  read-only `https://opml.radiotime.com/Browse.ashx?c=playlist&id=s...&render=json`
  lookup through the existing ePlus CORS relay.
- The shared `useStationRealtime` polling lifecycle loads this metadata at
  most once per 60 seconds, aborts on station switches, and continues while
  listening in a background tab. No second audio player or background worker.
- Song rows appear in the existing Queue/Playlist panel (desktop and mobile).
  Known current-song fields also update shared live track information.
- Only tracks with an identifiable title AND artist are shown. A DJ show,
  station name or programme slot is not silently transformed into a song.
- The most recent historical row is **not** automatically called 'Now Playing':
  only a TuneIn record explicitly marked current can update the live-track
  title, media session or LIVE badge.
- Errors, empty history and unavailable metadata produce a localized
  informational state. Playback remains independent.

## Important provider limitations

TuneIn's broadcaster AIR `Playing.ashx` is a **write** API, not a way to
query arbitrary listeners' song history. This integration does not send to
that API and does not require or store a TuneIn partner ID/key, Apple account,
user token or signed stream accessKey.

TuneIn may omit or delay playlist metadata, especially for syndicated Apple
Music streams. The read-only Browse endpoint is an observed, not guaranteed,
provider interface; the exact response and availability for all seven Apple
stations **must be verified on staging**. Empty data is expected and must not
be filled by fabricated tracks or an unrelated Apple Music personal-playback
API. A stream resolving successfully does not prove that song history is
available.

## Test and staging checklist

1. Run `npm test` and `npm run build` on the feature branch.
2. On `new-radio.eplus.dev`, listen to each of the seven Apple channels.
   Open Queue -> Playlist on desktop, iOS Safari and Android/Chrome.
3. Compare any displayed title, artist and current-song label to actual
   TuneIn station metadata; verify metadata isn't mistakenly derived from
   the DJ programme name.
4. With empty/faulted upstream playlist, verify the informative empty state
   and uninterrupted HLS playback. Resume, pause, switch and Next/Previous.
5. Change stations during a pending metadata request; stale responses must
   never replace the new station's playlist.
6. In DevTools confirm that no Apple HLS accessKey or personal token is ever
   appended to a metadata URL, persisted or logged.
7. Do not release to `main` until the supported providers and listening
   experience have passed browser QA. SEO title/description/JSON-LD remain
   unchanged by this feature.
