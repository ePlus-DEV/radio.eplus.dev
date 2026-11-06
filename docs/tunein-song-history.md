# TuneIn song/artist metadata — Apple Music Radio

Follow-up to merged [PR #372](https://github.com/ePlus-DEV/radio.eplus.dev/pull/372).

## What PR #372 does (and does not do)

PR #372 gets a freshly signed Apple HLS source through TuneIn's **Tune.ashx**.
This is an audio-stream resolver. It does **not** return a current song's title
or artist for presentation in the ePlus player.

## What this PR implements

1. For seven known Apple Music Radio station IDs only, call the anonymous
   **Describe.ashx** read endpoint with `id=s...` and `render=json`,
   through the same configured HTTPS CORS proxy as playback. The origin comes
   from `NUXT_PUBLIC_CORS_SERVER_1` via Nuxt `config.public.corsServer`;
   no Heroku address is hardcoded, and missing config disables the lookup.
2. Parse the nested `body -> outline -> station` response, looking for
   **current_song** and **current_artist**. Both must be non-empty, associated
   with the selected station, and not explicitly marked unavailable or
   commercial. **Never use show titles, station name, current_track blurbs or
   an arbitrary first playlist item as a substitute.**
3. Pass validated provider or in-stream ID3 metadata to `playback.liveTrack`,
   consumed by the existing
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


## HLS song detection in the actual shared player

The existing audio player now **attempts in-stream song detection** instead of
relying only on the public TuneIn Describe endpoint. This needs no second
player, external recognition service or scraped TuneIn session.

- On hls.js-capable browsers, listen to Hls.Events.FRAG_PARSING_METADATA for
  the currently playing Apple station. Parse actual ID3v2.3/v2.4 TIT2
  (song title) and TPE1 (artist) frames from fragments decoded by the player.
- Keep decoded metadata aligned to its presentation timestamp (PTS); publish
  the observed song only when the media playback reaches that position.
  Discard pending tracks on station/source changes, pause and reconnect.
- On native HLS browsers (such as Safari/iPhone), observe genuine metadata
  TextTrack cuechange events for concurrent title/artist ID3 frames, and
  unbind those listeners on source change or unmount.
- Prefer a valid, in-stream song over TuneIn Describe's delayed/empty fields.
  Update the shared dock, full-screen player, OS Media Session, and Queue's
  session-only history. Never treat a previous history row as live.
- No URL with accessKey, raw ID3, audio payload, playlist or provider response
  is logged or persisted. No fabricated title/artist is displayed.

This is **metadata detection**, NOT acoustic fingerprint identification.
If the stream has no supported ID3 title/artist pair, the UI continues to
show the station name instead of guessing.

### Verified live-provider status

- CI #42075947598: 7/7 TuneIn Describe responses had empty current_song
  and current_artist, with has_song=false.
- CI #42131026067: Apple Music 1, Hits, Chill HLS master/media playlists had
  no EXT-X-DATERANGE song/artist metadata. PROGRAM-DATE-TIME is only time.
- The user's 2026-11-06 HAR confirmed actual CMAF `emsg` (version 1,
  `https://aomedia.org/emsg/ID3`) in Apple Music Holiday Hits segments
  `fileSequence53.m4s`–`fileSequence57.m4s`, with ID3v2.4 `TIT2` and
  `TPE1`. Verified *song* pairs include “Underneath the Tree” / Kelly
  Clarkson and “Make It to Christmas” / Alessia Cara.
- The *same* stream includes an “Eddie Francis” / “Holiday Hits” presenter
  card with `TIT2`/`TPE1` but no `TALB` or Apple adamid PRIV marker.
  For Apple streams, the client now requires an album or Apple song marker to
  avoid representing a host as the current song. Ordinary stations retain
  their existing ID3 parsing behavior.
- The former probe's host/path guard rejected Apple's legitimate
  `/3p-tune-in/bb/as_live_aod/.../cmaf/.../fileSequenceN.m4s` segments.
  The branch-scoped probe now accepts that constrained path and summarizes
  tags **without logging track values, URL tokens, or audio**.
- Unit tests reconstruct only the non-sensitive ID3 frames and expected
  playback PTS from the HAR; the complete HAR and audio segments are never
  added to the repository. hls.js exposes CMAF emsg tags via
  `FRAG_PARSING_METADATA`, while Safari native HLS uses timed TextTrack cues.
  **Browser-level confirmation remains necessary** before release; captured
  metadata proves existence, not correct live player rendering on all devices.

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
  reported metadata and real audible audio; confirm UI on Chrome, iPhone Safari,
  dock, mini, modal,
  and OS Media Session. Background play / tab visibility must not break audio.
- When Describe returns empty/403/malformed data, show the station name, not
  the previous track. Keep already observed session history in Queue.
- Pause/resume/Next/Previous, rapid station changes, HLS lease renewal and
  country-radio metadata must continue working.
- Do not merge/release to `main` before browser QA. No claims of observed
  real-world song synchronization are made based on mocked tests alone.
