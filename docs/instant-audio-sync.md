# InstantAudio country sync

The repository includes a scheduled GitHub Action that discovers country sites from
`https://instant.audio/` and uses the stream API endpoint exposed by those sites.

## Safety model

- Missing countries are imported by default.
- Existing countries are augmented safely: current stations stay untouched and only new, non-duplicate streams are appended.
- A run imports at most three missing countries unless manually targeted.
- InstantAudio's structured `result.station` + `result.streams` payload is preferred, so HTML/container entries are ignored and playable audio streams are selected explicitly.
- Stream endpoints are validated before a station is written; duplicate stream URLs are skipped.
- Station artwork is downloaded into `public/img/<area>/<country>/` and country JSON uses the local asset path. Images are MIME-checked and capped at 2 MB.
- Artwork priority is InstantAudio metadata, then the image embedded in the country station list, then the Radio Browser favicon fallback.
- Requests are deliberately serialized and rate-limited.
- Changes are proposed through a pull request, never pushed directly to `main`.
- The crawler check stays lightweight; the normal pull-request CI owns the Nuxt build.
- The upstream endpoint is undocumented and can change without notice.

## Manual runs

From **Actions → InstantAudio data sync → Run workflow**:

- leave **country** empty to detect missing countries automatically;
- set **country** (for example `latvia`) to target one country;
- enable **refresh_existing** to scan existing countries for additional stations without replacing current data.
- targeting an existing **country** is also non-destructive and only appends newly discovered streams.

The script can also be tested locally:

```bash
node scripts/sync-instant-audio.mjs --country=cuba --refresh-existing --max-stations=3 --dry-run
```

## InstantAudio payload used

For endpoints such as `https://api.instant.audio/data/streams/45/radio-rebelde`, the sync reads station metadata (`title`, website, signal, ACRCloud availability) and the `streams` array. Entries marked as containers or non-audio MIME types are ignored. The structured stream list is used before the generic URL heuristic.

World metadata keeps the repository's existing underscore region keys (for example `north_america`) and `/assets/radio/...` data paths.

## Lightweight fallback strategy

The crawler follows the same simple idea as the original PHP grabber: read the country page, extract station slugs, call the structured stream endpoint, and write JSON plus local artwork.

GitHub-hosted runners can still receive HTTP 403 from InstantAudio. To avoid turning every sync into a browser build:

1. try the structured InstantAudio API directly;
2. stop direct requests after 3 consecutive HTTP 403 responses;
3. fall back to Radio Browser when no InstantAudio station can be collected;
4. browser helpers remain available in the script as an emergency directory fallback, but the normal workflow does not install Chromium/Crawlee.

This keeps scheduled syncs fast while retaining a repository snapshot of the InstantAudio country directory when upstream discovery is unavailable.
