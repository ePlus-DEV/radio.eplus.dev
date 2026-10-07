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
- Artwork priority is InstantAudio metadata, then the image embedded in the country station list.
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

## Direct-only sync strategy

The crawler intentionally follows the original PHP grabber model:

1. read the country page server-side;
2. extract the InstantAudio country ID and station slugs;
3. call the structured InstantAudio stream API directly with a browser-like User-Agent;
4. download station artwork locally and write the country JSON.

There is no Playwright/Crawlee browser mode and no Radio Browser station fallback. If the direct InstantAudio API is blocked or returns no playable stations, the selected country fails and the GitHub Actions job reports a real failure instead of silently switching data sources.

The repository country registry may still be used only as a snapshot of country URLs when the InstantAudio directory page itself cannot be refreshed; station data is never sourced from that snapshot.
