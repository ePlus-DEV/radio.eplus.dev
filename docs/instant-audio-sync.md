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

## Fallback strategy

The crawler keeps the sync lightweight:

1. try the structured InstantAudio API directly;
2. after 3 consecutive HTTP 403 responses, mark the direct API as blocked for the entire workflow run;
3. use Radio Browser for the current and remaining countries instead of retrying blocked InstantAudio requests;
4. use the repository country snapshot when the InstantAudio directory cannot be refreshed.

There is no Playwright/Crawlee browser fallback. Pull-request validation also avoids live upstream calls and runs syntax checks plus unit tests only.


## Vietnam legacy address enrichment

For Vietnam, the sync keeps Radio Browser coordinates and can reverse-geocode them with VietMap Reverse API v4.

Set the GitHub Actions secret `VIETMAP_API_KEY`. The sync requests `display_type=6`, then caches:

- `location.lat/lng`
- `address.legacy.full`
- structured legacy `province / district / ward`
- `address.current` for the post-merger address

The station UI only exposes a **Quận / Huyện (địa chỉ cũ)** filter, backed by `address.legacy.district.name`. Ward data is retained for search/detail use but is not a filter level.

If the secret is missing or VietMap is temporarily unavailable, radio sync still succeeds and keeps the coordinates without blocking station updates.
