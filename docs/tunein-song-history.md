# TuneIn song/artist metadata — Apple Music Radio

Follow-up to merged [PR #372](https://github.com/ePlus-DEV/radio.eplus.dev/pull/372).

## What PR #372 does (and does not do)

PR #372 gets a freshly signed Apple HLS source through TuneIn's **Tune.ashx**.
This is an audio-stream resolver. It does **not** return a current song's title
or artist for presentation in the ePlus player.

## What this PR implements

1. For seven known Apple Music Radio station IDs only, call the anonymous
   **Describe.ashx** read endpoint with `id=s...` and `render=json`,
   through the same fixed owner-operated CORS relay as playback.
2. Parse the nested `body -> outline -> station` response, looking for
   **current_song** and **current_artist**. Both must be non-empty, associated
   with the selected station, and not explicitly marked unavailable or
   commercial. **Never use show titles, station name, current_track blurbs or
   an arbitrary first playlist item as a substitute.**
3. Pass this metadata to `playback.liveTrack`, consumed by the existing
   `Player.vue`: dock, mini player, full-screen Now Playing, Media Session.
   On missing/failed data, fall back to station name, not a stale song.
4. As songs change during the **current browser listening session**, keep at
   most 30 genuinely observed `{ track_title, track_artist }` pairs in the
   existing desktop/mobile Queue -> Playlist. This is local observation, NOT
   TuneIn's remote song-play history, and is not persisted or backfilled.
   Exact start time is unknown, so no timestamp is invented.
5. Reuse `useStationRealtime`'s existing station-scoped polling (60 seconds).
   Abort obsolete requests on station changes. Metadata errors do not
   interrupt HLS audio or affect renewal logic.
6. Localize the optional metadata/unavailable states across seven languages.
   No SEO titles, descriptions, OG data or JSON-LD modified.

## Provider / accuracy limits

TuneIn's AIR `Playing.ashx` is a broadcaster **WRITE** API that uses partner
credentials. The client never calls it. `Browse.ashx?c=playlist` is a
directory browsing surface, **not a verified music-track history feed**, and
has been removed from this change.

The public Describe endpoint is documented to expose `current_song` and
`current_artist` **when available**; not every station provides them.
TuneIn states that now-playing metadata without broadcaster AIR integration
may arrive several minutes late. Do not claim exact audio synchronization,
song duration, album cover or 24-hour history, and do not fabricate missing
song titles or artists.

Useful references:
- https://tunein-api.corehacked.com/endpoints-and-streaming/endpoints/describe-endpoint/response-fields-and-meaning
- https://help.tunein.com/support/solutions/articles/151000172254-why-is-there-no-song-artist-information-displayed-when-my-station-is-playing-
- https://tunein.com/broadcasters/api/

## Verify on staging before merge

- Run `npm test` and the full Nuxt prerender / UI checks.
- Confirm live Describe responses for **all seven Apple stations** through the
  ePlus relay; inspect only sanitized field names and ordinary artist/title
  values, never HLS access keys. Some stations may correctly return no song.
- While listening, compare the current-song title and artist with TuneIn's
  reported metadata; confirm UI on Chrome, iPhone Safari, dock, mini, modal,
  and OS Media Session. Background play / tab visibility must not break audio.
- When Describe returns empty/403/malformed data, show the station name, not
  the previous track. Keep already observed session history in Queue.
- Pause/resume/Next/Previous, rapid station changes, HLS lease renewal and
  country-radio metadata must continue working.
- Do not merge/release to `main` before browser QA. No claims of observed
  real-world song synchronization are made based on mocked tests alone.
